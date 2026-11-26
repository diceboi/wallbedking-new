#!/usr/bin/env node
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const env = fs
  .readFileSync(envPath, "utf8")
  .split("\n")
  .reduce((acc, line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) acc[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    return acc;
  }, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "ProductImages";

// All 15 unique images from the Google Sheet (9 Sileopod + 6 Moonchair)
const IMAGES = [
  // Sileopod Acoustic Booths (9 unique model photos; UI1-XL has no image yet)
  { folder: "acoustic-booths", name: "sileopod-v5-s", driveId: "1hO4zyae3XVW6MBSBUBZIUeUIxqtIKjjn" },
  { folder: "acoustic-booths", name: "sileopod-v5-m", driveId: "1V8beX-ayYnly__0SwQ4Jk5umZSEUz2rb" },
  { folder: "acoustic-booths", name: "sileopod-v5-l", driveId: "1ZcEjVZDf5FNFwq5wTGahP8cKOoEqJWhQ" },
  { folder: "acoustic-booths", name: "sileopod-v4-s", driveId: "1med5LbeBF-Ah0Rqh61E5PtxPCVZ1jz9M" },
  { folder: "acoustic-booths", name: "sileopod-v4-m", driveId: "14OaCbXdmlBunLvATZj7fXb7ZX9Dsxy6i" },
  { folder: "acoustic-booths", name: "sileopod-v4-l", driveId: "1cQ_c6aB14k317jD34Eyyz2m8i7o7m-7S" }, // will verify exact IDs dynamically below
];

// Dynamically extract exact Drive IDs from the downloaded xlsx so zero typos are possible!
import { execSync } from "child_process";

const extractedJson = execSync(
  `python3 - << 'PYEOF'
import zipfile, xml.etree.ElementTree as ET, json, re

path = "/Users/szaszszabolcs/.gemini/antigravity/brain/980a26c0-145b-40e1-8ce5-ace1cf82e7ac/scratch/pod-moonchair.xlsx"
with zipfile.ZipFile(path) as z:
    ns = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    strings = ["".join(t.text or "" for t in si.findall(".//main:t", ns)) for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("main:si", ns)]

    def parse_sheet(sheet_xml):
        rows = ET.fromstring(z.read(sheet_xml)).findall(".//main:sheetData/main:row", ns)
        parsed = []
        for row in rows:
            vals = {}
            for c in row.findall("main:c", ns):
                col = "".join(ch for ch in c.attrib["r"] if ch.isalpha())
                t = c.attrib.get("t")
                v = c.find("main:v", ns)
                val = strings[int(v.text)] if (t == "s" and v is not None) else (v.text if v is not None else "")
                if str(val).strip(): vals[col] = str(val).strip()
            if vals: parsed.append(vals)
        headers = parsed[0]
        return [{headers.get(k, k): v for k, v in r.items()} for r in parsed[1:]]

    pod_rows = parse_sheet("xl/worksheets/sheet1.xml")
    moon_rows = parse_sheet("xl/worksheets/sheet2.xml")

    out = []
    seen_models = set()
    for d in pod_rows:
        sku = d.get("manufacturer_sku", "")
        if not sku or sku in seen_models:
            continue
        seen_models.add(sku)
        m = re.search(r"drive\.google\.com/file/d/([a-zA-Z0-9_-]+)", d.get("image", ""))
        if m:
            out.append({"folder": "acoustic-booths", "name": f"sileopod-{sku.lower()}", "driveId": m.group(1), "model": sku})

    if moon_rows:
        imgs = json.loads(moon_rows[0].get("product_images", "[]"))
        for idx, url in enumerate(imgs, start=1):
            m = re.search(r"drive\.google\.com/file/d/([a-zA-Z0-9_-]+)", url)
            if m:
                out.append({"folder": "moonchair", "name": f"moonchair-{idx}", "driveId": m.group(1), "model": f"LN6789-{idx}"})

    print(json.dumps(out))
PYEOF`,
  { encoding: "utf8" }
);

const imageSpecs = JSON.parse(extractedJson.trim());
console.log(`Found ${imageSpecs.length} unique images to process.`);

async function downloadDriveFile(driveId) {
  const url = `https://drive.google.com/uc?export=download&id=${driveId}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${driveId}`);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/html")) {
    throw new Error(`Got HTML instead of image for ${driveId} (check Drive sharing)`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function optimizeAndUpload(spec) {
  const rawBuf = await downloadDriveFile(spec.driveId);
  const meta = await sharp(rawBuf).metadata();

  const variants = [
    { tier: "1K", maxDim: 1024, quality: 78 },
    { tier: "2K", maxDim: 2048, quality: 82 },
  ];

  const urls = {};
  for (const v of variants) {
    const webpBuf = await sharp(rawBuf)
      .rotate()
      .resize({
        width: v.maxDim,
        height: v.maxDim,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: v.quality, effort: 6, smartSubsample: true })
      .toBuffer();

    const outMeta = await sharp(webpBuf).metadata();
    const storagePath = `${spec.folder}/${v.tier}/${spec.name}.webp`;

    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, webpBuf, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    urls[v.tier] = {
      url: pub.publicUrl,
      width: outMeta.width,
      height: outMeta.height,
      kb: Math.round((webpBuf.length / 1024) * 10) / 10,
    };
  }

  console.log(
    `OK ${spec.folder}/${spec.name} (orig ${meta.width}x${meta.height} ${Math.round(rawBuf.length / 1024)}KB) -> 1K: ${urls["1K"].width}x${urls["1K"].height} (${urls["1K"].kb}KB) | 2K: ${urls["2K"].width}x${urls["2K"].height} (${urls["2K"].kb}KB)`
  );
  return { ...spec, urls };
}

async function main() {
  const results = [];
  for (const spec of imageSpecs) {
    results.push(await optimizeAndUpload(spec));
  }
  const manifestPath = "/Users/szaszszabolcs/.gemini/antigravity/brain/980a26c0-145b-40e1-8ce5-ace1cf82e7ac/scratch/image-manifest.json";
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved manifest (${results.length} assets) to ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
