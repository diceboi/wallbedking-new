import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT_DIR = process.cwd();
const XLSX_PATH = path.join(ROOT_DIR, "amazon-bedframe-classic-fr-fullcontent-processing-summary.xlsx");
const SCRATCH_XML_PATH = path.join(ROOT_DIR, "scratch", "sheet3.xml");
const FEEDS_DIR = path.join(ROOT_DIR, "src", "data", "feeds");
const OUTPUT_JSON_PATH = path.join(FEEDS_DIR, "amazon-fr-classic.json");
const REGISTRY_PATH = path.join(FEEDS_DIR, "feeds-registry.json");

// Ensure dirs exist
if (!fs.existsSync(FEEDS_DIR)) {
  fs.mkdirSync(FEEDS_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(ROOT_DIR, "scratch"))) {
  fs.mkdirSync(path.join(ROOT_DIR, "scratch"), { recursive: true });
}

// 1. Extract sheet3.xml if needed
if (!fs.existsSync(SCRATCH_XML_PATH)) {
  console.log("Extracting sheet3.xml from Excel template...");
  const psExtract = `Add-Type -AssemblyName System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::OpenRead('${XLSX_PATH.replace(/\\/g, "/")}'); $entry = $zip.GetEntry('xl/worksheets/sheet3.xml'); [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, '${SCRATCH_XML_PATH.replace(/\\/g, "/")}', $true); $zip.Dispose();`;
  execSync(`powershell -ExecutionPolicy Bypass -Command "${psExtract}"`);
}

// 2. Clean mojibake / corrupted encoding in French text
function cleanFrenchText(str) {
  if (!str || typeof str !== "string") return str;

  let s = str;

  // Unescape XML entities first
  s = s.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&quot;/g, '"');

  // Fix UTF-8 decoded as Latin-1 (mojibake)
  s = s.replace(/Ã&#xa0;/g, "à");
  s = s.replace(/Ã\s/g, "à ");
  s = s.replace(/â€“/g, "–");
  s = s.replace(/â€”/g, "—");
  s = s.replace(/â€™/g, "’");
  s = s.replace(/â€œ/g, "“");
  s = s.replace(/â€/g, "”");
  s = s.replace(/Ã©/g, "é");
  s = s.replace(/Ã¨/g, "è");
  s = s.replace(/Ãª/g, "ê");
  s = s.replace(/Ã«/g, "ë");
  s = s.replace(/Ã§/g, "ç");
  s = s.replace(/Ã¢/g, "â");
  s = s.replace(/Ã®/g, "î");
  s = s.replace(/Ã¯/g, "ï");
  s = s.replace(/Ã´/g, "ô");
  s = s.replace(/Ã»/g, "û");
  s = s.replace(/Ã¹/g, "ù");
  s = s.replace(/Ã‰/g, "É");
  s = s.replace(/Ã€/g, "À");

  // Common corruptions from template
  const replacements = [
    [/[\uFFFD\?][\?\""\u201C\u201D]/g, " – "],
    [/[\uFFFD\?]t/gi, "’"],
    [/[\uFFFD\?]T/g, "’"],
    [/SystAme/g, "Système"],
    [/systAme/g, "système"],
    [/A%volutif/g, "Évolutif"],
    [/Acvolutif/g, "évolutif"],
    [/Acvolutives/g, "évolutives"],
    [/Acvolution/g, "évolution"],
    [/SuperposAc/g, "Superposé"],
    [/superposAc/g, "superposé"],
    [/Garantie A Vie/g, "Garantie à Vie"],
    [/Garantie A vie/g, "Garantie à vie"],
    [/entiArement/g, "entièrement"],
    [/diffAcrents/g, "différents"],
    [/piAces/g, "pièces"],
    [/piAce/g, "pièce"],
    [/installAcs/g, "installés"],
    [/installAce/g, "installée"],
    [/fonctionnalitAcs/g, "fonctionnalités"],
    [/grAcce/g, "grâce"],
    [/IdAcal/g, "Idéal"],
    [/d’tamis/g, "d’amis"],
    [/d'tamis/g, "d'amis"],
    [/A domicile/g, "à domicile"],
    [/remplaAant/g, "remplaçant"],
    [/remplaAant/g, "remplaçant"],
    [/possibilitAc/g, "possibilité"],
    [/canapAc/g, "canapé"],
    [/crAcer/g, "créer"],
    [/adaptAc/g, "adapté"],
    [/pensAce/g, "pensée"],
    [/CompatibilitAc/g, "Compatibilité"],
    [/PraticitAc/g, "Praticité"],
    [/spAccifique/g, "spécifique"],
    [/fabriquAce/g, "fabriquée"],
    [/MAccanisme/g, "Mécanisme"],
    [/mAccanisme/g, "mécanisme"],
    [/vAcrins/g, "vérins"],
    [/contrAlAces/g, "contrôlées"],
    [/aprAs/g, "après"],
    [/Acconomisant/g, "économisant"],
    [/plutAt/g, "plutôt"],
    [/rAcduire/g, "réduire"],
    [/dAcchets/g, "déchets"],
    [/amAcnagement/g, "aménagement"],
    [/intAcrieur/g, "intérieur"],
    [/tranquillitAc/g, "tranquillité"],
    [/SAretAc/g, "Sûreté"],
    [/sAretAc/g, "sûreté"],
    [/Aatre/g, "être"],
    [/fixAc/g, "fixé"],
    [/AcloignAces/g, "éloignées"],
    [/AcloignAcs/g, "éloignés"],
    [/recommandAce/g, "recommandée"],
    [/prAcsence/g, "présence"],
    [/d’tenfants/g, "d’enfants"],
    [/d'tenfants/g, "d'enfants"],
    [/DIFFA%RENT/g, "DIFFÉRENT"],
    [/mAame/g, "même"],
    [/d’tautres/g, "d’autres"],
    [/d'tautres/g, "d'autres"],
    [/libAcrer/g, "libérer"],
    [/invitAc/g, "invité"],
    [/C’test/g, "C’est"],
    [/C'test/g, "C'est"],
    [/d’un/g, "d'un"],
    [/A\s/g, "à "],
    [/&nbsp;/g, " "],
  ];

  for (const [pattern, replacement] of replacements) {
    s = s.replace(pattern, replacement);
  }

  // Clean unescaped single 'A ' at word boundaries if followed by lower
  s = s.replace(/\bA\s/g, "à ");
  s = s.replace(/\s–\s–\s/g, " – ");

  return s.trim();
}

// 3. Read and parse sheet3.xml
console.log("Parsing sheet3.xml rows...");
const rawXml = fs.readFileSync(SCRATCH_XML_PATH, "utf-8");

// Column index mapping: in rows 2..39, columns start from C (A=record_no, B=err_code)
const COLUMN_MAPPING = {
  C: "item_sku",
  D: "external_product_id",
  E: "external_product_id_type",
  F: "item_name",
  G: "brand_name",
  H: "product_description",
  I: "bullet_point1",
  J: "bullet_point2",
  K: "bullet_point3",
  L: "bullet_point4",
  M: "bullet_point5",
  N: "generic_keywords",
  O: "main_image_url",
  P: "other_image_url1",
  Q: "other_image_url2",
  R: "other_image_url3",
  S: "other_image_url4",
  T: "other_image_url5",
  U: "recommended_browse_nodes",
  V: "parent_child",
  W: "parent_sku",
  X: "relationship_type",
  Y: "variation_theme",
  Z: "size_name",
  AA: "standard_price",
  AB: "currency",
  AC: "quantity",
  AD: "fulfillment_channel",
  AE: "care_instructions",
  AF: "furniture_finish",
  AG: "finish_type",
  AH: "product_type",
  AI: "condition_type",
  AJ: "update_delete",
  AK: "warranty_description",
  AL: "safety_warning",
  AM: "country_of_origin",
};

// Regex match all rows
const rowRegex = /<row r="(\d+)"[^>]*>(.*?)<\/row>/gs;
const cellRegex = /<c r="([A-Z]+)\d+"[^>]*>(?:<is><t>(.*?)<\/t><\/is>|<v>(.*?)<\/v>)?<\/c>/gs;

const products = [];
let rowMatch;

while ((rowMatch = rowRegex.exec(rawXml)) !== null) {
  const rowNum = parseInt(rowMatch[1], 10);
  // Skip row 1 (the misplaced header in the Excel)
  if (rowNum === 1) continue;

  const rowContent = rowMatch[2];
  const item = {
    id: `item_${rowNum}`,
    row_number: rowNum,
    feed_id: "amazon-fr-classic",
    updated_at: new Date().toISOString(),
  };

  let cellMatch;
  while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
    const colLetter = cellMatch[1];
    const val = cellMatch[2] !== undefined ? cellMatch[2] : (cellMatch[3] !== undefined ? cellMatch[3] : "");
    const field = COLUMN_MAPPING[colLetter];
    if (field) {
      item[field] = val;
    }
  }

  // If item has a SKU or parent SKU
  if (item.item_sku || item.item_name) {
    // Clean text fields
    item.item_name = cleanFrenchText(item.item_name || "");
    item.product_description = cleanFrenchText(item.product_description || "");
    item.bullet_point1 = cleanFrenchText(item.bullet_point1 || "");
    item.bullet_point2 = cleanFrenchText(item.bullet_point2 || "");
    item.bullet_point3 = cleanFrenchText(item.bullet_point3 || "");
    item.bullet_point4 = cleanFrenchText(item.bullet_point4 || "");
    item.bullet_point5 = cleanFrenchText(item.bullet_point5 || "");
    item.care_instructions = cleanFrenchText(item.care_instructions || "");
    item.warranty_description = cleanFrenchText(item.warranty_description || "Garantie à vie");
    item.safety_warning = cleanFrenchText(item.safety_warning || "");
    item.generic_keywords = cleanFrenchText(item.generic_keywords || "");

    // Numbers & clean formats
    if (item.standard_price) {
      item.standard_price = parseFloat(item.standard_price) || null;
    } else {
      item.standard_price = null;
    }
    if (item.quantity) {
      item.quantity = parseInt(item.quantity, 10) || 0;
    } else {
      item.quantity = item.parent_child === "parent" ? null : 10;
    }

    // Default currency to EUR for France if GBP
    if (!item.currency || item.currency === "GBP") {
      item.currency = "EUR";
    }

    products.push(item);
  }
}

console.log(`Parsed ${products.length} products from Amazon France template.`);
const parents = products.filter((p) => p.parent_child === "parent");
const children = products.filter((p) => p.parent_child === "child");
console.log(`- Parent containers: ${parents.length} (${parents.map((p) => p.item_sku).join(", ")})`);
console.log(`- Child variations: ${children.length}`);

// Write products to JSON
fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(products, null, 2), "utf-8");
console.log(`✓ Saved ${products.length} feed items to ${OUTPUT_JSON_PATH}`);

// Update Registry
const registry = [
  {
    id: "amazon-fr-classic",
    name: "Amazon France – Morphy Classic Bedframes",
    marketplace: "Amazon",
    country: "France",
    countryCode: "fr",
    flag: "fr",
    currency: "EUR",
    targetCategory: "bed_frame",
    status: "Active",
    itemCount: products.length,
    parentCount: parents.length,
    childCount: children.length,
    feedUrl: "/api/feeds/amazon-fr-classic",
    templateFile: "amazon-bedframe-classic-fr-fullcontent-processing-summary.xlsx",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "otto-de",
    name: "OTTO Germany – Wall Beds",
    marketplace: "OTTO",
    country: "Germany",
    countryCode: "de",
    flag: "de",
    currency: "EUR",
    targetCategory: "Schrankbetten",
    status: "Draft",
    itemCount: 0,
    parentCount: 0,
    childCount: 0,
    feedUrl: "/api/feeds/otto-de",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mirakl-fr",
    name: "Mirakl FR (Leroy Merlin / Conforama)",
    marketplace: "Mirakl",
    country: "France",
    countryCode: "fr",
    flag: "fr",
    currency: "EUR",
    targetCategory: "Lit escamotable",
    status: "Draft",
    itemCount: 0,
    parentCount: 0,
    childCount: 0,
    feedUrl: "/api/feeds/mirakl-fr",
    updatedAt: new Date().toISOString(),
  },
];

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf-8");
console.log(`✓ Saved registry to ${REGISTRY_PATH}`);
console.log("All done!");
