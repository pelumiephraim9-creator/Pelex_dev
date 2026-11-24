#!/usr/bin/env python3
"""Verify official ArtCraft ZIPs, publish WASM to R2, and stage lightweight app files."""
import hashlib
import json
import os
import pathlib
import re
import shutil
import tempfile
import urllib.request
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public/artcraft/package-manifest.json"
APPS_DIR = ROOT / "public/artcraft/apps"
WASM_TMP = pathlib.Path(tempfile.mkdtemp(prefix="artcraft-wasm-"))
ASSET_BASE = os.environ.get("ARTCRAFT_ASSET_BASE_URL", "").strip().rstrip("/")
if not ASSET_BASE:
    raise SystemExit("Missing ARTCRAFT_ASSET_BASE_URL secret (public R2 custom-domain base URL ending in /artcraft-wasm).")

# Repair a duplicated URL accidentally saved in the repository secret, e.g.
# https://hosthttps://host/artcraft-wasm. Keep the final complete URL.
if ASSET_BASE.count("://") > 1:
    ASSET_BASE = ASSET_BASE[ASSET_BASE.rfind("https://"):]
if not ASSET_BASE.startswith("https://") or "://" in ASSET_BASE[len("https://"):]:
    raise SystemExit("ARTCRAFT_ASSET_BASE_URL is malformed; expected one HTTPS URL.")
if not ASSET_BASE.endswith("/artcraft-wasm"):
    raise SystemExit("ARTCRAFT_ASSET_BASE_URL must end with /artcraft-wasm.")


def safe_extract(zf, dest):
    dest = pathlib.Path(dest).resolve()
    for info in zf.infolist():
        name = info.filename.replace("\\", "/")
        path = pathlib.PurePosixPath(name)
        if path.is_absolute() or ".." in path.parts:
            raise RuntimeError(f"Unsafe ZIP path rejected: {name}")
        mode = info.external_attr >> 16
        if mode & 0o170000 == 0o120000:
            raise RuntimeError(f"ZIP symlink rejected: {name}")
        target = (dest / pathlib.Path(*path.parts)).resolve()
        if dest not in target.parents and target != dest:
            raise RuntimeError(f"ZIP path escaped extraction root: {name}")
        if info.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as source, open(target, "wb") as output:
                shutil.copyfileobj(source, output)


data = json.loads(MANIFEST.read_text(encoding="utf-8"))
packages = [item for item in data.get("packages", []) if item.get("platform") == "web"]
if len(packages) != 15:
    raise SystemExit(f"Expected 15 web packages, found {len(packages)}")

APPS_DIR.mkdir(parents=True, exist_ok=True)
summary = []
text_suffixes = {".html", ".js", ".mjs", ".css", ".json", ".webmanifest", ".svg"}

for package in packages:
    app_id = package["id"]
    source_url = package["official_asset_url"]
    expected_hash = package["sha256"].lower()
    print(f"Downloading {app_id} {package['version']}", flush=True)
    request = urllib.request.Request(source_url, headers={"User-Agent": "Pelex-ArtCraft-Package-Sync"})

    with urllib.request.urlopen(request, timeout=180) as response, tempfile.NamedTemporaryFile() as archive:
        digest = hashlib.sha256()
        while True:
            block = response.read(1024 * 1024)
            if not block:
                break
            digest.update(block)
            archive.write(block)
        actual_hash = digest.hexdigest()
        if actual_hash != expected_hash:
            raise SystemExit(f"SHA-256 mismatch for {app_id}: expected {expected_hash}, got {actual_hash}")
        archive.flush()

        with zipfile.ZipFile(archive.name) as zf:
            bad_member = zf.testzip()
            if bad_member:
                raise SystemExit(f"ZIP CRC failure for {app_id}: {bad_member}")
            extract_root = pathlib.Path(tempfile.mkdtemp(prefix=f"{app_id}-"))
            safe_extract(zf, extract_root)

    indexes = list(extract_root.rglob("index.html"))
    if not indexes:
        raise SystemExit(f"No index.html found in {app_id} ZIP")
    index = min(indexes, key=lambda item: len(item.relative_to(extract_root).parts))
    app_root = index.parent
    target = APPS_DIR / app_id
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(app_root, target)

    wasm_files = list(extract_root.rglob("*.wasm"))
    if not wasm_files:
        print(f"WARNING: no standalone WASM file found for {app_id}", flush=True)

    wasm_target = WASM_TMP / app_id
    wasm_target.mkdir(parents=True, exist_ok=True)
    wasm_urls = {}
    for wasm in wasm_files:
        shutil.copy2(wasm, wasm_target / wasm.name)
        wasm_urls[wasm.name] = f"{ASSET_BASE}/{app_id}/{wasm.name}"

    # Rewrite both absolute and relative references to the external R2 objects.
    # Then remove local WASM binaries so Cloudflare Pages never receives large files/LFS pointers.
    for asset in list(target.rglob("*")):
        if not asset.is_file() or asset.suffix.lower() not in text_suffixes:
            continue
        try:
            source = asset.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        updated = source
        for filename, public_url in wasm_urls.items():
            # Replace the complete reference, including any existing absolute URL or
            # /artcraft-wasm/<app>/ prefix. Replacing only the basename creates a
            # malformed URL such as https://hosthttps://host/.../file.wasm.
            escaped = re.escape(filename)
            reference = re.compile(
                r"""(?:https?://[^\s'"<>)]*/|(?:\.\.?/|/)?(?:[A-Za-z0-9_.@+-]+/)*)"""
                + escaped
            )
            updated = reference.sub(lambda _match: public_url, updated)
        # Catch app-specific absolute paths assembled in source text even when their
        # WASM filename is not present in the extracted inventory.
        updated = updated.replace(f"/artcraft-wasm/{app_id}/", f"{ASSET_BASE}/{app_id}/")
        if updated != source:
            asset.write_text(updated, encoding="utf-8")

    # Fail closed if any generated text asset still contains a duplicated URL.
    for asset in target.rglob("*"):
        if not asset.is_file() or asset.suffix.lower() not in text_suffixes:
            continue
        try:
            final_text = asset.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if any(token.count("://") > 1 for token in final_text.replace(chr(34), " ").replace(chr(39), " ").replace("<", " ").replace(">", " ").split()):
            raise SystemExit(f"Malformed duplicated URL remains in {app_id}: {asset.relative_to(target)}")
    for local_wasm in target.rglob("*.wasm"):
        local_wasm.unlink()

    summary.append({
        "id": app_id,
        "sha256": actual_hash,
        "index": str((target / index.relative_to(app_root)).relative_to(ROOT)),
        "wasm_files": list(wasm_urls.keys()),
        "external_wasm_urls": list(wasm_urls.values()),
    })
    shutil.rmtree(extract_root)
    print(f"VERIFIED + UNZIPPED {app_id}: {len(wasm_files)} WASM file(s); local WASM excluded", flush=True)

(WASM_TMP / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(f"WASM_DIR={WASM_TMP}")
