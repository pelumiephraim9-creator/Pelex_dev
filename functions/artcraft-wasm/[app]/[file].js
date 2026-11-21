const ASSETS = {
  "cadcraft/cadcraft-web-a91fdcd993cc5580_bg.wasm": "714cb7221bdd24712a59c099bbec5c0ead7b2a09",
  "craft-anything/craft-anything-web-e374ff1db17de5f2_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "deckcraft/deckcraft-web-f863e8c546b80fd1_bg.wasm": "714cb7221bdd24712a59c099bbec5c0ead7b2a09",
  "designcraft/designcraft-web-6fe2a088b8a9125b_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "effectcraft/effectcraft_web_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "figcraft/figcraft-web-f987f34d74d47a59_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "gridcraft/gridcraft-web-fdc723373f2aa0d8_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "lightcraft/lightcraft_web_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "materialcraft/materialcraft-web-f0e3f75f9ac4c726_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "pdfcraft/pdfcraft-web-dbf16682ba914f2f_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "photocraft/photocraft-web-boot-f1b57f4718fcff8_bg.wasm": "a8aa4d6daf2a5ba517a5e8792cdd5bc805f5a7b8",
  "pdfcraft/pdfcraft-ocr-worker-b363fe94bbdd0923_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "soundcraft/soundcraft-web-1a7ddbf5e69df875_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "texturecraft/texturecraft-web-44b3e3b6a536dac4_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "vectorcraft/vectorcraft-web-80ef79e0b9e423a1_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0",
  "wordcraft/wordcraft-web-bc9cdbc0b42827ee_bg.wasm": "1666d2c72731f87a91f46d8fddae3f431043eba0"
};

export async function onRequest({ params }) {
  const key = String(params.app || "") + "/" + String(params.file || "");
  const commit = ASSETS[key];
  if (!commit) return new Response("ArtCraft asset not found", { status: 404 });

  const upstream = "https://media.githubusercontent.com/media/pelumiephraim9-creator/Uncle_Pelex_Agent/" +
    commit + "/public/artcraft/apps/" + key;

  let response;
  try {
    response = await fetch(upstream, { headers: { "Accept": "application/octet-stream" } });
  } catch (error) {
    return new Response("ArtCraft asset upstream unavailable", { status: 502 });
  }
  if (!response.ok || !response.body) {
    return new Response("ArtCraft asset upstream returned " + response.status, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/wasm");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  return new Response(response.body, { status: 200, headers });
}
