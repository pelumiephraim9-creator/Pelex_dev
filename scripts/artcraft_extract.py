#!/usr/bin/env python3
"""Download, verify and safely unpack official ArtCraft web ZIPs.
Small app files are committed under public/artcraft/apps. WASM files are
uploaded to Cloudflare R2 so Cloudflare Pages' per-file limit is not hit.
"""
import hashlib, json, os, pathlib, shutil, sys, tempfile, urllib.request, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public/artcraft/package-manifest.json"
APPS_DIR = ROOT / "public/artcraft/apps"
WASM_TMP = pathlib.Path(tempfile.mkdtemp(prefix="artcraft-wasm-"))
ASSET_BASE = os.environ.get("ARTCRAFT_ASSET_BASE_URL", "").rstrip("/")
if not ASSET_BASE:
    raise SystemExit("Missing ARTCRAFT_ASSET_BASE_URL secret (public R2 custom-domain base URL ending in /artcraft-wasm).")

def safe_extract(zf, dest):
    dest = pathlib.Path(dest).resolve()
    for info in zf.infolist():
        name = info.filename.replace("\\", "/")
        p = pathlib.PurePosixPath(name)
        if p.is_absolute() or ".." in p.parts:
            raise RuntimeError(f"Unsafe ZIP path rejected: {name}")
        mode = info.external_attr >> 16
        if mode & 0o170000 == 0o120000:
            raise RuntimeError(f"ZIP symlink rejected: {name}")
        target = (dest / pathlib.Path(*p.parts)).resolve()
        if dest not in target.parents and target != dest:
            raise RuntimeError(f"ZIP path escaped extraction root: {name}")
        if info.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as src, open(target, "wb") as out:
                shutil.copyfileobj(src, out)

data = json.loads(MANIFEST.read_text())
packages = [p for p in data.get("packages", []) if p.get("platform") == "web"]
if len(packages) != 15:
    raise SystemExit(f"Expected 15 web packages, found {len(packages)}")
APPS_DIR.mkdir(parents=True, exist_ok=True)
summary = []
for pkg in packages:
    app_id = pkg["id"]
    url = pkg["official_asset_url"]
    expected = pkg["sha256"].lower()
    print(f"Downloading {app_id} {pkg['version']}", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Pelex-ArtCraft-Package-Sync"})
    with urllib.request.urlopen(req, timeout=180) as response, tempfile.NamedTemporaryFile() as tmp:
        digest = hashlib.sha256()
        while True:
            block = response.read(1024 * 1024)
            if not block: break
            digest.update(block); tmp.write(block)
        actual = digest.hexdigest()
        if actual != expected:
            raise SystemExit(f"SHA-256 mismatch for {app_id}: expected {expected}, got {actual}")
        tmp.flush()
        with zipfile.ZipFile(tmp.name) as zf:
            bad = zf.testzip()
            if bad:
                raise SystemExit(f"ZIP CRC failure for {app_id}: {bad}")
            extract_root = pathlib.Path(tempfile.mkdtemp(prefix=f"{app_id}-"))
            safe_extract(zf, extract_root)
        indexes = list(extract_root.rglob("index.html"))
        if not indexes:
            raise SystemExit(f"No index.html found in {app_id} ZIP")
        index = min(indexes, key=lambda p: len(p.relative_to(extract_root).parts))
        app_root = index.parent
        target = APPS_DIR / app_id
        if target.exists(): shutil.rmtree(target)
        shutil.copytree(app_root, target)
        wasm_files = list(extract_root.rglob("*.wasm"))
        if not wasm_files:
            print(f"WARNING: no standalone WASM file found for {app_id}", flush=True)
        wasm_target = WASM_TMP / app_id
        wasm_target.mkdir(parents=True, exist_ok=True)
        for wasm in wasm_files:
            shutil.copy2(wasm, wasm_target / wasm.name)
        # Point the app's absolute WASM fetch path at the R2 public domain.
        # Replace absolute WASM runtime paths wherever the official build references them.
        text_suffixes = {".html", ".js", ".mjs", ".css", ".json", ".webmanifest", ".svg"}
        for asset in target.rglob("*"):
            if asset.is_file() and asset.suffix.lower() in text_suffixes:
                try:
                    content = asset.read_text(encoding="utf-8")
                except UnicodeDecodeError:
                    continue
                content = content.replace(f"/artcraft-wasm/{app_id}/", f"{ASSET_BASE}/{app_id}/")
                asset.write_text(content, encoding="utf-8")
        summary.append({"id": app_id, "sha256": actual, "index": str((target / index.relative_to(app_root)).relative_to(ROOT)), "wasm_files": [p.name for p in wasm_files]})
        shutil.rmtree(extract_root)
        print(f"VERIFIED + UNZIPPED {app_id}: {len(wasm_files)} WASM file(s)", flush=True)

(WASM_TMP / "summary.json").write_text(json.dumps(summary, indent=2))
print(f"WASM_DIR={WASM_TMP}")
