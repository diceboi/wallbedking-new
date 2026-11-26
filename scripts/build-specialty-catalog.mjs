#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const XLSX_PATH =
  "/Users/szaszszabolcs/.gemini/antigravity/brain/980a26c0-145b-40e1-8ce5-ace1cf82e7ac/scratch/pod-moonchair.xlsx";
const MANIFEST_PATH =
  "/Users/szaszszabolcs/.gemini/antigravity/brain/980a26c0-145b-40e1-8ce5-ace1cf82e7ac/scratch/image-manifest.json";
const OUT_PATH = path.resolve(process.cwd(), "src/data/specialty-catalog.json");

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const imageByModel = new Map(manifest.map((m) => [m.model, m.urls]));
const moonImages = manifest
  .filter((m) => m.folder === "moonchair")
  .sort((a, b) => a.name.localeCompare(b.name));

// Extract full sheet rows via python3
const rawJson = execSync(
  `python3 - << 'PYEOF'
import zipfile, xml.etree.ElementTree as ET, json
path = "${XLSX_PATH}"
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
    print(json.dumps({"pods": parse_sheet("xl/worksheets/sheet1.xml"), "moons": parse_sheet("xl/worksheets/sheet2.xml")}))
PYEOF`,
  { encoding: "utf8", maxBuffer: 25 * 1024 * 1024 }
);

const { pods, moons } = JSON.parse(rawJson);

// ── COLOR MAPS (HEX + 7-LOCALE NAMES) ───────────────────────────────────────
const RAL_COLORS = {
  "White (RAL 9003)": {
    code: "9003",
    hex: "#F4F4F2",
    en: "White (RAL 9003)",
    us: "White (RAL 9003)",
    de: "Weiß (RAL 9003)",
    fr: "Blanc (RAL 9003)",
    es: "Blanco (RAL 9003)",
    it: "Bianco (RAL 9003)",
    por: "Branco (RAL 9003)",
  },
  "Black (RAL 7021)": {
    code: "7021",
    hex: "#2F3234",
    en: "Black (RAL 7021)",
    us: "Black (RAL 7021)",
    de: "Schwarzgrau (RAL 7021)",
    fr: "Noir (RAL 7021)",
    es: "Negro (RAL 7021)",
    it: "Nero (RAL 7021)",
    por: "Preto (RAL 7021)",
  },
  "Umbra (RAL 7022)": {
    code: "7022",
    hex: "#4C4B47",
    en: "Umbra (RAL 7022)",
    us: "Umbra (RAL 7022)",
    de: "Umbragrau (RAL 7022)",
    fr: "Ombre (RAL 7022)",
    es: "Sombra (RAL 7022)",
    it: "Ombra (RAL 7022)",
    por: "Umbra (RAL 7022)",
  },
  "Sand (RAL 1002)": {
    code: "1002",
    hex: "#D2B773",
    en: "Sand (RAL 1002)",
    us: "Sand (RAL 1002)",
    de: "Sandgelb (RAL 1002)",
    fr: "Sable (RAL 1002)",
    es: "Arena (RAL 1002)",
    it: "Sabbia (RAL 1002)",
    por: "Areia (RAL 1002)",
  },
  "Blue (RAL 7031)": {
    code: "7031",
    hex: "#5B686D",
    en: "Blue (RAL 7031)",
    us: "Blue (RAL 7031)",
    de: "Blaugrau (RAL 7031)",
    fr: "Bleu (RAL 7031)",
    es: "Azul (RAL 7031)",
    it: "Blu (RAL 7031)",
    por: "Azul (RAL 7031)",
  },
  "Cement (RAL 7033)": {
    code: "7033",
    hex: "#7D8471",
    en: "Cement (RAL 7033)",
    us: "Cement (RAL 7033)",
    de: "Zementgrau (RAL 7033)",
    fr: "Ciment (RAL 7033)",
    es: "Cemento (RAL 7033)",
    it: "Cemento (RAL 7033)",
    por: "Cimento (RAL 7033)",
  },
  "Red (RAL 3013)": {
    code: "3013",
    hex: "#9C322E",
    en: "Red (RAL 3013)",
    us: "Red (RAL 3013)",
    de: "Tomatenrot (RAL 3013)",
    fr: "Rouge (RAL 3013)",
    es: "Rojo (RAL 3013)",
    it: "Rosso (RAL 3013)",
    por: "Vermelho (RAL 3013)",
  },
  "Green (RAL 6005)": {
    code: "6005",
    hex: "#114232",
    en: "Green (RAL 6005)",
    us: "Green (RAL 6005)",
    de: "Moosgrün (RAL 6005)",
    fr: "Vert (RAL 6005)",
    es: "Verde (RAL 6005)",
    it: "Verde (RAL 6005)",
    por: "Verde (RAL 6005)",
  },
  "Altrosa (RAL 3014)": {
    code: "3014",
    hex: "#CB7375",
    en: "Altrosa (RAL 3014)",
    us: "Altrosa (RAL 3014)",
    de: "Altrosa (RAL 3014)",
    fr: "Vieux Rose (RAL 3014)",
    es: "Rosa Antiguo (RAL 3014)",
    it: "Rosa Antico (RAL 3014)",
    por: "Rosa Antigo (RAL 3014)",
  },
};

const MOON_COLORS = {
  "Orange (77912-03)": { code: "03", hex: "#E56B24", de: "Orange", fr: "Orange", es: "Naranja", it: "Arancione", por: "Laranja" },
  "Beige (77912-08)": { code: "08", hex: "#D7C6B0", de: "Beige", fr: "Beige", es: "Beige", it: "Beige", por: "Bege" },
  "Light Grey (77912-99)": { code: "99", hex: "#C8CACD", de: "Hellgrau", fr: "Gris clair", es: "Gris claro", it: "Grigio chiaro", por: "Cinzento claro" },
  "Grey (77912-09)": { code: "09", hex: "#8E9297", de: "Grau", fr: "Gris", es: "Gris", it: "Grigio", por: "Cinzento" },
  "Taupe (77912-02)": { code: "02", hex: "#9E8D7B", de: "Taupe", fr: "Taupe", es: "Topo", it: "Tortora", por: "Taupe" },
  "Mustard (77912-11)": { code: "11", hex: "#C89B2B", de: "Senfgelb", fr: "Moutarde", es: "Mostaza", it: "Senape", por: "Mostarda" },
  "Lime Green (77912-10)": { code: "10", hex: "#8CB53F", de: "Limettengrün", fr: "Vert citron", es: "Verde lima", it: "Verde lime", por: "Verde lima" },
  "Dark Green (77912-05)": { code: "05", hex: "#21503A", de: "Dunkelgrün", fr: "Vert foncé", es: "Verde oscuro", it: "Verde scuro", por: "Verde escuro" },
  "Petrol Blue (77912-01)": { code: "01", hex: "#1F5666", de: "Petrolblau", fr: "Bleu pétrole", es: "Azul petróleo", it: "Blu petrolio", por: "Azul petróleo" },
  "Turquoise (77912-04)": { code: "04", hex: "#2CA3A8", de: "Türkis", fr: "Turquoise", es: "Turquesa", it: "Turchese", por: "Turquesa" },
  "Charcoal (77912-13)": { code: "13", hex: "#43464B", de: "Anthrazit", fr: "Anthracite", es: "Antracita", it: "Antracite", por: "Antracite" },
  "Red (77912-14)": { code: "14", hex: "#B52B2B", de: "Rot", fr: "Rouge", es: "Rojo", it: "Rosso", por: "Vermelho" },
  "Black (77912-06)": { code: "06", hex: "#1C1D1F", de: "Schwarz", fr: "Noir", es: "Negro", it: "Nero", por: "Preto" },
  "Royal Blue (77912-07)": { code: "07", hex: "#23499E", de: "Königsblau", fr: "Bleu roi", es: "Azul real", it: "Blu reale", por: "Azul royal" },
  "Denim Blue (77912-35)": { code: "35", hex: "#4B6E91", de: "Denimblau", fr: "Bleu denim", es: "Azul vaquero", it: "Blu denim", por: "Azul ganga" },
  "Pale Blue (77912-33)": { code: "33", hex: "#9EC0D8", de: "Hellblau", fr: "Bleu pâle", es: "Azul pálido", it: "Azzurro pallido", por: "Azul claro" },
  "Mint Green (77912-32)": { code: "32", hex: "#8BC9B1", de: "Mintgrün", fr: "Vert menthe", es: "Verde menta", it: "Verde menta", por: "Verde menta" },
  "Dusty Pink (77912-29)": { code: "29", hex: "#C9969D", de: "Altrosa", fr: "Rose poudré", es: "Rosa empolvado", it: "Rosa cipria", por: "Rosa velho" },
  "Slate Blue (77912-101)": { code: "101", hex: "#546A82", de: "Schieferblau", fr: "Bleu ardoise", es: "Azul pizarra", it: "Blu ardesia", por: "Azul ardósia" },
  "Golden Orange (77912-27)": { code: "27", hex: "#E08B26", de: "Goldorange", fr: "Orange doré", es: "Naranja dorado", it: "Arancio dorato", por: "Laranja dourado" },
  "Yellow (77912-28)": { code: "28", hex: "#E6C136", de: "Gelb", fr: "Jaune", es: "Amarillo", it: "Giallo", por: "Amarelo" },
  "Teal (77912-30)": { code: "30", hex: "#1B7A78", de: "Blaugrün", fr: "Bleu canard", es: "Verde azulado", it: "Ottanio", por: "Verde-azulado" },
  "Mid Grey (77912-26)": { code: "26", hex: "#6F747A", de: "Mittelgrau", fr: "Gris moyen", es: "Gris medio", it: "Grigio medio", por: "Cinzento médio" },
  "Rust (77912-55)": { code: "55", hex: "#A84A2A", de: "Rostbraun", fr: "Rouille", es: "Óxido", it: "Ruggine", por: "Ferrugem" },
};

// ── SILEOPOD SIZE / CAPACITY METADATA ───────────────────────────────────────
const POD_MODEL_META = {
  "V5-S": { sizeCode: "S", capacity: 1, internal: "850 × 980 mm" },
  "V5-M": { sizeCode: "M", capacity: 2, internal: "1350 × 1280 mm" },
  "V5-L": { sizeCode: "L", capacity: 4, internal: "2050 × 1280 mm" },
  "V4-S": { sizeCode: "S", capacity: 1, internal: "894 × 920 mm" },
  "V4-M": { sizeCode: "M", capacity: 2, internal: "1440 × 1220 mm" },
  "V4-L": { sizeCode: "L", capacity: 4, internal: "1986 × 1220 mm" },
  "UI1-S": { sizeCode: "S", capacity: 1, internal: "846 × 986 mm" },
  "UI1-M": { sizeCode: "M", capacity: 2, internal: "1346 × 1286 mm" },
  "UI1-L": { sizeCode: "L", capacity: 4, internal: "2046 × 1286 mm" },
  "UI1-XL": { sizeCode: "XL", capacity: 6, internal: "" },
};

const SERIES_CONSTRUCTION = {
  V5: {
    de: "Die V5-Serie vereint einen Rahmen aus Stahl und 6063-Aluminium mit präzise gefertigten Stahl-Außenpaneelen und einer magnetisch schließenden Tür. Im Inneren sorgen 12 mm Akustikpaneele und Teppichboden für angenehme Raumakustik, während Verbundsicherheitsglas (4 + 0,76 + 4 mm) für Offenheit sorgt. Der sechslagige Wandaufbau kombiniert schallabsorbierende, dämpfende und isolierende Schichten. Über den Drehregler lassen sich Lüftung, dimmbares 4000-K-Licht sowie Telefon-, Arbeits- und Entspannungsmodi ganz ohne App steuern.",
    fr: "La série V5 associe une structure en acier et aluminium 6063 à des panneaux extérieurs en acier thermolaqué et une porte à fermeture magnétique. À l'intérieur, des panneaux acoustiques de 12 mm et une moquette adoucissent l'ambiance, tandis que le verre feuilleté (4 + 0,76 + 4 mm) préserve la connexion visuelle. Sa paroi à six couches combine absorption, amortissement et isolation phonique. Une commande rotative intuitive règle la ventilation, l'éclairage 4000 K variable et les modes appel, travail ou détente sans application.",
    es: "La serie V5 combina una estructura de acero y aluminio 6063 con paneles exteriores de acero pintado y puerta de cierre magnético. En el interior, los paneles acústicos de 12 mm y la moqueta suavizan el espacio, mientras que el vidrio laminado (4 + 0,76 + 4 mm) mantiene la conexión visual. Su pared de seis capas integra materiales fonoabsorbentes, amortiguadores y aislantes. Un mando giratorio permite controlar ventilación, iluminación regulable de 4000 K y modos de llamada, trabajo o descanso sin necesidad de aplicación.",
    it: "La serie V5 combina un telaio in acciaio e alluminio 6063 con pannelli esterni in acciaio verniciato e porta a chiusura magnetica. All'interno, pannelli acustici da 12 mm e moquette attenuano il riverbero, mentre il vetro stratificato (4 + 0,76 + 4 mm) mantiene il contatto visivo con l'ambiente. La parete a sei strati unisce materiali fonoassorbenti, smorzanti e isolanti. Un comando rotativo gestisce ventilazione, luce dimmerabile 4000 K e scenari chiamata, lavoro o relax senza bisogno di app.",
    por: "A série V5 combina uma estrutura em aço e alumínio 6063 com painéis exteriores em aço lacado e porta de fecho magnético. No interior, painéis acústicos de 12 mm e alcatifa suavizam o ambiente, enquanto o vidro laminado (4 + 0,76 + 4 mm) mantém a ligação visual. A parede de seis camadas combina materiais fonoabsorventes, amortecedores e isolantes. Um comando rotativo controla a ventilação, iluminação regulável de 4000 K e modos de chamada, trabalho ou relaxamento sem necessidade de aplicação.",
  },
  V4: {
    de: "Die V4-Serie kombiniert einen präzisen 6063-Aluminiumrahmen mit EPDM-Dichtungen und einem automatischen Honeywell-Türschließer. 12 mm Akustikpaneele und Teppichboden schaffen ein ruhiges Innenklima, während die selbstschließende Tür den täglichen Gebrauch erleichtert. Optional ist ein höhenverstellbarer Schreibtisch (730–1200 mm) erhältlich.",
    fr: "La série V4 associe un châssis de précision en aluminium 6063 à des joints EPDM et un ferme-porte automatique Honeywell. Les panneaux acoustiques de 12 mm et la moquette créent un intérieur feutré, tandis que la porte à fermeture automatique facilite les passages quotidiens. La gamme propose en option un bureau réglable en hauteur (730–1200 mm).",
    es: "La serie V4 une un bastidor de precisión en aluminio 6063 con juntas EPDM y cierrapuertas automático Honeywell. Los paneles acústicos de 12 mm y la moqueta crean un interior sereno, mientras que la puerta autocierre facilita el uso diario. La gama ofrece opcionalmente un escritorio regulable en altura (730–1200 mm).",
    it: "La serie V4 abbina un telaio di precisione in alluminio 6063 a guarnizioni EPDM e chiudiporta automatico Honeywell. I pannelli acustici da 12 mm e la moquette rendono l'interno confortevole, mentre la porta autochiudente agevola l'uso quotidiano. La gamma prevede l'opzione scrivania regolabile in altezza (730–1200 mm).",
    por: "A série V4 combina uma estrutura de precisão em alumínio 6063 com vedantes EPDM e mola de porta automática Honeywell. Os painéis acústicos de 12 mm e a alcatifa proporcionam um interior acolhedor, enquanto a porta de fecho automático facilita o uso diário. A gama inclui a opção de secretária regulável em altura (730–1200 mm).",
  },
  UI1: {
    de: "Die UI1-Serie nutzt eine Carbon-Verbundstruktur mit 55 mm Carbon-Schalldämmung, 15 mm Akustikpaneelen und Teppichboden. Ein automatischer Honeywell-Türschließer sorgt für hohen Alltagskomfort, und die Serie bietet zudem die Option auf einen höhenverstellbaren Schreibtisch.",
    fr: "La série UI1 repose sur une structure composite carbone avec isolation phonique carbone de 55 mm, panneaux acoustiques de 15 mm et moquette. Un ferme-porte automatique Honeywell assure un confort d'utilisation quotidien, et la gamme propose une option bureau réglable en hauteur.",
    es: "La serie UI1 emplea una estructura compuesta de carbono con aislamiento acústico de carbono de 55 mm, paneles acústicos de 15 mm y moqueta. Un cierrapuertas automático Honeywell aporta comodidad diaria y la gama incluye la opción de escritorio regulable en altura.",
    it: "La serie UI1 utilizza una struttura in composito di carbonio con isolamento acustico al carbonio da 55 mm, pannelli acustici da 15 mm e moquette. Un chiudiporta automatico Honeywell garantisce praticità quotidiana e la gamma include l'opzione scrivania regolabile in altezza.",
    por: "A série UI1 utiliza uma estrutura em compósito de carbono com isolamento acústico de carbono de 55 mm, painéis acústicos de 15 mm e alcatifa. Uma mola de porta automática Honeywell garante praticidade diária e a gama inclui a opção de secretária regulável em altura.",
  },
};

function buildPodLocalizedFields(row, model, series, colorInfo) {
  const meta = POD_MODEL_META[model] || { sizeCode: "S", capacity: 1, internal: "" };
  const dimsText =
    row.width && row.length && row.height
      ? `${Math.round(Number(row.width))} × ${Math.round(Number(row.length))} × ${Math.round(Number(row.height))} mm`
      : null;
  const weightText = row.weight ? `${Math.round(Number(row.weight))} kg` : null;

  const capMap = {
    1: { de: "1 Person (Telefonate, Video-Meetings & konzentrierte Einzelarbeit)", fr: "1 personne (appels, visioconférences et travail concentré)", es: "1 persona (llamadas, videollamadas y trabajo individual concentrado)", it: "1 persona (chiamate, videochiamate e lavoro individuale concentrato)", por: "1 pessoa (chamadas, videochamadas e trabalho individual focado)" },
    2: { de: "2 Personen (1:1-Gespräche, Interviews & gemeinsames Arbeiten)", fr: "2 personnes (entretiens, réunions en duo et travail collaboratif)", es: "2 personas (reuniones uno a uno, entrevistas y trabajo colaborativo)", it: "2 persone (colloqui, riunioni a due e lavoro collaborativo)", por: "2 pessoas (reuniões individuais, entrevistas e trabalho colaborativo)" },
    4: { de: "bis zu 4 Personen (kleine Meetings, Brainstorming & hybride Team-Calls)", fr: "jusqu'à 4 personnes (petites réunions, brainstorming et appels d'équipe)", es: "hasta 4 personas (reuniones pequeñas, lluvia de ideas y llamadas híbridas)", it: "fino a 4 persone (piccole riunioni, brainstorming e call di squadra)", por: "até 4 pessoas (pequenas reuniões, brainstorming e videochamadas em equipa)" },
    6: { de: "Großformatige Besprechungs- und Teamkabine (XL)", fr: "Cabine acoustique grand format pour équipes (XL)", es: "Cabina acústica de gran formato para equipos (XL)", it: "Cabina acustica di grande formato per team (XL)", por: "Cabine acústica de grande formato para equipas (XL)" },
  };
  const cap = capMap[meta.capacity] || capMap[1];

  const shortNames = {
    de: `Sileopod ${model} Akustikkabine – ${colorInfo.de.split(" (")[0]}`,
    fr: `Cabine Acoustique Sileopod ${model} – ${colorInfo.fr.split(" (")[0]}`,
    es: `Cabina Acústica Sileopod ${model} – ${colorInfo.es.split(" (")[0]}`,
    it: `Cabina Acustica Sileopod ${model} – ${colorInfo.it.split(" (")[0]}`,
    por: `Cabine Acústica Sileopod ${model} – ${colorInfo.por.split(" (")[0]}`,
  };

  const desc = {
    de: `Mehr Ruhe, weniger Ablenkung. Die Sileopod ${model} Akustikkabine bietet einen geschützten Raum für ${cap.de} in Großraumbüros, Flughäfen, Coworking-Spaces und öffentlichen Bereichen. Entwickelt mit dem Mailänder Designteam Morpha: bis zu 32 dB Sprachpegelreduzierung, vollständiger Luftaustausch alle 60 Sekunden und modulare Montage ab 35 Minuten. Außenfarbe: ${colorInfo.de}.`,
    fr: `Moins de distractions, plus de concentration. La cabine acoustique Sileopod ${model} crée un espace privé pour ${cap.fr} dans les open spaces, aéroports, espaces partagés et bureaux hybrides. Conçue avec le studio milanais Morpha : réduction du niveau vocal jusqu'à 32 dB, renouvellement d'air toutes les 60 secondes et montage modulaire dès 35 minutes. Finition extérieure : ${colorInfo.fr}.`,
    es: `Menos distracciones, más privacidad. La cabina acústica Sileopod ${model} ofrece un espacio aislado para ${cap.es} en oficinas abiertas, aeropuertos, espacios compartidos y entornos híbridos. Diseñada con el equipo milanés Morpha: reducción del nivel de voz de hasta 32 dB, renovación del aire cada 60 segundos y montaje modular desde 35 minutos. Acabado exterior: ${colorInfo.es}.`,
    it: `Meno distrazioni, più concentrazione. La cabina acustica Sileopod ${model} crea uno spazio riservato per ${cap.it} in uffici open-space, aeroporti, spazi condivisi e ambienti ibridi. Sviluppata con il team milanese Morpha: riduzione del parlato fino a 32 dB, ricambio d'aria ogni 60 secondi e montaggio modulare a partire da 35 minuti. Finitura esterna: ${colorInfo.it}.`,
    por: `Menos distrações, mais privacidade. A cabine acústica Sileopod ${model} cria um espaço reservado para ${cap.por} em escritórios abertos, aeroportos, coworkings e espaços híbridos. Desenvolvida com a equipa milanesa Morpha: redução do nível de voz até 32 dB, renovação do ar a cada 60 segundos e montagem modular a partir de 35 minutos. Acabamento exterior: ${colorInfo.por}.`,
  };

  const ext = {
    de: `Ein ruhigerer Ort zum Denken, Sprechen und konzentrierten Arbeiten.\n\nLassen Sie den Trubel des Großraumbüros hinter sich. Die Sileopod ${model} bietet Platz für ${cap.de} und schafft eine geschlossene akustische Rückzugszone in Büros, Flughäfen, Cafés und hybriden Arbeitswelten.\n\nItalienisches Design für den Arbeitsalltag\nEntwickelt mit dem Mailänder Designteam Morpha vereint Sileopod minimalistisches italienisches Design mit durchdachter Akustiktechnik. Die Oberfläche in ${colorInfo.de} fügt sich harmonisch in moderne Räume ein.\n\nWeniger Ablenkung. Mehr Privatsphäre.\nBis zu 32 dB Sprachpegelreduzierung (ISO 23351-1, Akustikklasse A) sorgen dafür, dass vertrauliche Gespräche in der Kabine bleiben und das Umfeld ruhig bleibt.\n\nFrische Luft & schneller Aufbau\nLeise Lüfter erneuern die Innenluft alle 60 Sekunden, gesteuert über Präsenzsensoren für Licht und Belüftung. Dank modularer Steck- und Magnetelemente gelingt die Montage ab ca. 35 Minuten.\n\nKonstruktion der Serie ${series}\n${SERIES_CONSTRUCTION[series].de}\n\nAuf einen Blick\n• Modell: ${model}\n• Außenfarbe: ${colorInfo.de}${dimsText ? `\n• Außenmaße (B × T × H): ${dimsText}` : ""}${meta.internal ? `\n• Innenmaße Boden (B × T): ${meta.internal}` : ""}${weightText ? `\n• Gewicht: ${weightText}` : ""}\n• Kapazität: ${cap.de}`,
    fr: `Un espace plus calme pour réfléchir, échanger et avancer efficacement.\n\nÉloignez-vous du bruit ambiant. La Sileopod ${model} offre un refuge acoustique conçu pour ${cap.fr}, idéal pour les bureaux ouverts, aéroports, espaces publics et environnements hybrides.\n\nDesign italien pensé pour le travail\nConçue avec le studio milanais Morpha, Sileopod allie esthétique italienne minimaliste et ingénierie acoustique. La finition extérieure ${colorInfo.fr} affirme une présence élégante dans tout aménagement.\n\nMoins de bruit. Plus de confidentialité.\nRéduction du niveau de parole jusqu'à 32 dB (tests ISO 23351-1, performance acoustique Classe A) pour des appels confidentiels sans déranger l'entourage.\n\nAir renouvelé & montage modulaire\nLa ventilation silencieuse renouvelle l'air toutes les 60 secondes, avec détection de présence pour l'éclairage et la ventilation. L'assemblage modulaire s'effectue à partir de 35 minutes.\n\nConception de la série ${series}\n${SERIES_CONSTRUCTION[series].fr}\n\nEn résumé\n• Modèle : ${model}\n• Finition extérieure : ${colorInfo.fr}${dimsText ? `\n• Dimensions extérieures (L × P × H) : ${dimsText}` : ""}${meta.internal ? `\n• Dimensions intérieures au sol (L × P) : ${meta.internal}` : ""}${weightText ? `\n• Poids : ${weightText}` : ""}\n• Capacité : ${cap.fr}`,
    es: `Un lugar más tranquilo para pensar, hablar y trabajar con foco.\n\nAléjese del ruido ambiental. Sileopod ${model} ofrece un refugio acústico cerrado pensado para ${cap.es} en oficinas abiertas, aeropuertos, espacios públicos y entornos híbridos.\n\nDiseño italiano para la jornada laboral\nDesarrollada junto al equipo milanés Morpha, Sileopod combina estética italiana minimalista e ingeniería acústica. El acabado exterior ${colorInfo.es} aporta elegancia a cualquier espacio.\n\nMenos distracciones. Más privacidad.\nReducción del nivel de voz de hasta 32 dB (ensayos ISO 23351-1, rendimiento acústico Clase A) para mantener la privacidad de cada conversación.\n\nAire fresco y montaje rápido\nVentiladores silenciosos renuevan el aire interior cada 60 segundos, con iluminación y ventilación activadas por presencia. Su sistema modular permite el montaje desde 35 minutos.\n\nConstrucción de la serie ${series}\n${SERIES_CONSTRUCTION[series].es}\n\nDe un vistazo\n• Modelo: ${model}\n• Acabado exterior: ${colorInfo.es}${dimsText ? `\n• Dimensiones exteriores (An × Pr × Al): ${dimsText}` : ""}${meta.internal ? `\n• Dimensiones interiores de suelo (An × Pr): ${meta.internal}` : ""}${weightText ? `\n• Peso: ${weightText}` : ""}\n• Capacidad: ${cap.es}`,
    it: `Uno spazio più silenzioso per pensare, parlare e lavorare al meglio.\n\nAllontanati dal brusio dell'open space. Sileopod ${model} offre uno spazio acustico chiuso pensato per ${cap.it}, ideale per uffici, aeroporti, aree pubbliche e ambienti ibridi.\n\nDesign italiano per il lavoro quotidiano\nSviluppata con il team milanese Morpha, Sileopod unisce stile italiano minimalista e ingegneria acustica. La finitura esterna ${colorInfo.it} valorizza con equilibrio ogni ambiente.\n\nMeno distrazioni. Più privacy.\nRiduzione del livello vocale fino a 32 dB (test ISO 23351-1, classe acustica A) per conversazioni riservate senza disturbare chi lavora vicino.\n\nAria sempre fresca e montaggio rapido\nVentole silenziose rinnovano l'aria ogni 60 secondi con accensione automatica di luce e ventilazione tramite sensore di presenza. La struttura modulare consente il montaggio a partire da 35 minuti.\n\nStruttura della serie ${series}\n${SERIES_CONSTRUCTION[series].it}\n\nIn sintesi\n• Modello: ${model}\n• Finitura esterna: ${colorInfo.it}${dimsText ? `\n• Dimensioni esterne (L × P × A): ${dimsText}` : ""}${meta.internal ? `\n• Dimensioni interne pavimento (L × P): ${meta.internal}` : ""}${weightText ? `\n• Peso: ${weightText}` : ""}\n• Capacità: ${cap.it}`,
    por: `Um espaço mais silencioso para pensar, falar e trabalhar com concentração.\n\nAfaste-se do ruído dos espaços abertos. A Sileopod ${model} cria um refúgio acústico fechado para ${cap.por}, ideal para escritórios, aeroportos, espaços públicos e ambientes híbridos.\n\nDesign italiano para o dia de trabalho\nDesenvolvida com a equipa de design milanesa Morpha, a Sileopod combina linhas minimalistas italianas com engenharia acústica. O acabamento exterior ${colorInfo.por} integra-se perfeitamente em interiores modernos.\n\nMenos distrações. Mais privacidade.\nRedução do nível de voz até 32 dB (testes ISO 23351-1, desempenho acústico Classe A) para chamadas confidenciais sem perturbar quem trabalha por perto.\n\nAr fresco e montagem modular\nVentiladores silenciosos renovam o ar interior a cada 60 segundos, com iluminação e ventilação ativadas por sensor de presença. A construção modular permite montagem a partir de 35 minutos.\n\nConstrução da série ${series}\n${SERIES_CONSTRUCTION[series].por}\n\nEm resumo\n• Modelo: ${model}\n• Acabamento exterior: ${colorInfo.por}${dimsText ? `\n• Dimensões exteriores (L × P × A): ${dimsText}` : ""}${meta.internal ? `\n• Dimensões interiores do piso (L × P): ${meta.internal}` : ""}${weightText ? `\n• Peso: ${weightText}` : ""}\n• Capacidade: ${cap.por}`,
  };

  return {
    name_en: row.name_en || row.name,
    name_us: row.name_us || row.name,
    name_de: shortNames.de,
    name_fr: shortNames.fr,
    name_es: shortNames.es,
    name_it: shortNames.it,
    name_por: shortNames.por,
    name_pt: shortNames.por,
    description_en: row.description_en || row.description || "",
    description_us: row.description_us || row.description_en || "",
    description_de: desc.de,
    description_fr: desc.fr,
    description_es: desc.es,
    description_it: desc.it,
    description_por: desc.por,
    description_pt: desc.por,
    extended_description_en: row.extended_description_en || "",
    extended_description_us: row.extended_description_us || row.extended_description_en || "",
    extended_description_de: ext.de,
    extended_description_fr: ext.fr,
    extended_description_es: ext.es,
    extended_description_it: ext.it,
    extended_description_por: ext.por,
    extended_description_pt: ext.por,
  };
}

function buildMoonLocalizedFields(row, colorEn, info) {
  const cCode = info.code;
  const localizedNames = {
    en: row.name_en || row.name,
    us: row.name_us || row.name,
    de: `Moonchair – Bluetooth-Drehsessel mit Hocker – ${info.de} (${cCode})`,
    fr: `Moonchair – Fauteuil Lounge Pivotant Bluetooth & Pouf – ${info.fr} (${cCode})`,
    es: `Moonchair – Sillón Giratorio Bluetooth con Otomana – ${info.es} (${cCode})`,
    it: `Moonchair – Poltrona Lounge Girevole Bluetooth con Pouf – ${info.it} (${cCode})`,
    por: `Moonchair – Poltrona Giratória Bluetooth com Pufe – ${info.por} (${cCode})`,
  };

  const desc = {
    de: `Ihre Musik. Ihr Moment. Ihr Moonchair. Entworfen vom Pariser Designer JF Rolet vereint dieser skulpturale Drehsessel eine kugelförmige Silhouette mit passendem Hocker, großzügiger Polsterung und integriertem Bluetooth-HiFi-Soundsystem. Mit 360°-Drehfunktion und strukturiertem 3D-Mesh-Bezug (Stoff 77912). Farbe: ${info.de} (Farbcode ${cCode}).`,
    fr: `Votre musique. Votre moment. Votre Moonchair. Imaginé par le designer parisien JF Rolet, ce fauteuil lounge sculptural associe une silhouette sphérique enveloppante, un pouf assorti, une assise généreusement rembourrée et un système audio HiFi Bluetooth intégré. Rotation à 360° et revêtement mesh 3D texturé (tissu 77912). Couleur : ${info.fr} (code ${cCode}).`,
    es: `Tu música. Tu momento. Tu Moonchair. Diseñado por el francés JF Rolet en París, este sillón escultural combina una forma esférica envolvente, otomana a juego, cojín acolchado de espuma y sistema de audio HiFi Bluetooth integrado. Giro de 360° y tapizado en malla 3D texturizada (tejido 77912). Color: ${info.es} (código ${cCode}).`,
    it: `La tua musica. Il tuo momento. La tua Moonchair. Firmata dal designer parigino JF Rolet, questa poltrona lounge scultorea unisce una forma sferica avvolgente, pouf coordinato, ampia imbottitura e sistema audio HiFi Bluetooth integrato. Base girevole a 360° e rivestimento in rete 3D testurizzata (tessuto 77912). Colore: ${info.it} (codice ${cCode}).`,
    por: `A sua música. O seu momento. A sua Moonchair. Criada pelo designer parisiense JF Rolet, esta poltrona lounge escultural combina uma silhueta esférica envolvente, pufe a condizer, acolchoamento generoso e sistema de som HiFi Bluetooth integrado. Rotação a 360° e estofo em malha 3D texturizada (tecido 77912). Cor: ${info.por} (código ${cCode}).`,
  };

  const ext = {
    de: `Ihre Musik. Ihr Moment. Ihr Moonchair.\n\nMoonchair lädt zum Entschleunigen ein. Legen Sie die Füße auf dem passenden runden Hocker hoch, starten Sie Ihre Lieblingsplaylist und genießen Sie skulpturales Design mit integriertem Bluetooth-HiFi-Klang.\n\nEntworfen in Paris von JF Rolet\nDie markante, aus gepolsterten Ringen geformte Schale umschließt ein dickes Sitzkissen und eine ergonomische Rückenlehne. Ein innenliegender Stahlrahmen sorgt für Stabilität, während weicher Schaumstoff hohen Sitzkomfort bietet.\n\nIntegriertes Bluetooth-HiFi-Soundsystem\nDie Lautsprecher sind direkt in die Schale integriert. Koppeln Sie Ihr Gerät per Bluetooth-Taste und passen Sie Lautstärke, Bass und Höhen separat am Bedienfeld an – inklusive Ein-/Ausschalter und USB-Anschluss.\n\n360° drehbar & strukturierter 3D-Mesh-Bezug\nAuf dem fünfstrahligen Metallfuß dreht sich der Moonchair mühelos um 360°. Der 3D-Mesh-Stoff 77912 (100 % Polyester, 530 g/m²) verleiht den Rundungen eine markante Tiefe. Ausführung: ${info.de} (Farbcode ${cCode}).\n\nAuf einen Blick\n• Set: Lounge-Sessel inkl. passendem runden Hocker\n• Designer: JF Rolet, Paris (Modell LN6789)\n• Maße Sessel (B × T × H): 114 × 104 × 135 cm\n• Gestell: Innenliegender Stahlrahmen mit Schaumpolsterung\n• Fuß: Fünfstrahliger Metallfuß, 360° drehbar\n• Audio: Integriertes Bluetooth-HiFi-System (Lautstärke, Bass, Höhen, USB)\n• Bezug: Strukturierter 3D-Mesh-Stoff 77912 (100 % Polyester) – ${info.de} (${cCode})\n\nBitte bestätigen Sie Ihr gewähltes Stoffmuster vor der Bestellung. Produktfotos zeigen Referenzfarben.`,
    fr: `Votre musique. Votre moment. Votre Moonchair.\n\nMoonchair vous invite à ralentir et savourer l'instant. Posez vos pieds sur le pouf assorti, lancez votre album préféré et profitez d'un design sculptural intégrant un système audio HiFi Bluetooth.\n\nUne forme signée JF Rolet, Paris\nSa coque arrondie composée d'anneaux rembourrés encadre un coussin d'assise circulaire généreux et un dossier enveloppant. Une structure interne en acier garantit la tenue, tandis que le garnissage mousse offre un confort durable.\n\nVotre bande-son intégrée au fauteuil\nLe système HiFi Bluetooth est intégré directement dans la coque. Appairez votre appareil en un geste et réglez séparément le volume, les basses et les aigus depuis le panneau de commande équipé d'un bouton marche/arrêt et d'un port USB.\n\nRotation 360° et tissu mesh 3D texturé\nMonté sur un piètement métallique cinq branches pivotant à 360°, Moonchair s'adapte à chaque moment. Le tissu 77912 en mesh 3D (100 % polyester, 530 g/m²) sublime chaque courbe. Finition : ${info.fr} (code ${cCode}).\n\nEn résumé\n• Ensemble : fauteuil lounge avec pouf rond assorti\n• Designer : JF Rolet, Paris (modèle LN6789)\n• Dimensions fauteuil (L × P × H) : 114 × 104 × 135 cm\n• Structure : cadre interne en acier et mousse haute densité\n• Base : piètement métal 5 branches pivotant à 360°\n• Audio : enceintes HiFi Bluetooth intégrées (volume, basses, aigus, USB)\n• Revêtement : mesh 3D texturé 77912 (100 % polyester) – ${info.fr} (${cCode})\n\nVeuillez confirmer votre échantillon de tissu avant commande. Les photos présentent des finitions de référence.`,
    es: `Tu música. Tu momento. Tu Moonchair.\n\nMoonchair invita a desconectar y disfrutar sin prisas. Apoya los pies en la otomana a juego, pon tu álbum favorito y descubre un icono de diseño con sonido HiFi Bluetooth integrado.\n\nDiseño parisino de JF Rolet\nSu carcasa esférica formada por anillos tapizados envuelve un grueso asiento circular y un respaldo ergonómico. Su estructura interna de acero aporta solidez y el acolchado de espuma garantiza máxima comodidad.\n\nSonido HiFi Bluetooth integrado\nEl sistema de altavoces HiFi se integra dentro de la propia carcasa. Empareja tu dispositivo mediante Bluetooth y ajusta por separado volumen, graves y agudos desde el panel integrado con interruptor y puerto USB.\n\nGiro de 360° y malla 3D texturizada\nSu base metálica de cinco puntas gira 360° con suavidad. El tejido 77912 en malla 3D (100 % poliéster, 530 g/m²) realza las curvas del diseño. Acabado: ${info.es} (código ${cCode}).\n\nDe un vistazo\n• Conjunto: sillón lounge con otomana redonda a juego\n• Diseñador: JF Rolet, París (modelo LN6789)\n• Dimensiones del sillón (An × Pr × Al): 114 × 104 × 135 cm\n• Estructura: bastidor interno de acero con acolchado de espuma\n• Base: pie metálico de 5 radios con giro de 360°\n• Audio: altavoces HiFi Bluetooth integrados (volumen, graves, agudos, USB)\n• Tapizado: malla 3D texturizada 77912 (100 % poliéster) – ${info.es} (${cCode})\n\nPor favor, confirme su muestra de tejido antes de pedir. Las fotografías muestran acabados de referencia.`,
    it: `La tua musica. Il tuo momento. La tua Moonchair.\n\nMoonchair invita a rallentare e godersi il momento. Appoggia i piedi sul pouf coordinato, avvia la tua playlist preferita e lasciati avvolgere dal design scultoreo con audio HiFi Bluetooth integrato.\n\nCreata a Parigi dal designer JF Rolet\nLa scocca tondeggiante a fasce imbottite racchiude un generoso cuscino circolare e uno schienale ergonomico. Il telaio interno in acciaio dona solidità, mentre l'imbottitura in schiuma assicura comfort avvolgente.\n\nAudio HiFi Bluetooth integrato nella scocca\nAbbina il tuo dispositivo con il tasto Bluetooth e personalizza il suono grazie ai controlli separati di volume, bassi e alti, completi di accensione e porta USB a portata di mano.\n\nRotazione a 360° e rivestimento 3D mesh\nLa base metallica a cinque razze ruota liberamente a 360°. Il tessuto 3D mesh 77912 (100% poliestere, 530 g/m²) valorizza ogni curva. Versione: ${info.it} (codice ${cCode}).\n\nIn sintesi\n• Set: poltrona lounge con pouf rotondo coordinato\n• Designer: JF Rolet, Parigi (modello LN6789)\n• Dimensioni poltrona (L × P × A): 114 × 104 × 135 cm\n• Struttura: telaio interno in acciaio con imbottitura in schiuma\n• Base: base metallica a 5 razze girevole a 360°\n• Audio: sistema HiFi Bluetooth integrato (volume, bassi, alti, USB)\n• Rivestimento: rete 3D testurizzata 77912 (100% poliestere) – ${info.it} (${cCode})\n\nConferma il campione di tessuto scelto prima di ordinare. Le fotografie mostrano finiture di riferimento.`,
    por: `A sua música. O seu momento. A sua Moonchair.\n\nA Moonchair convida a abrandar e aproveitar o momento. Apoie os pés no pufe a condizer, coloque o seu álbum favorito e desfrute de um design escultural com som HiFi Bluetooth integrado.\n\nCriada em Paris pelo designer JF Rolet\nA concha arredondada em anéis estofados envolve um assento circular generoso e um encosto anatómico. A estrutura interna em aço garante solidez e o acolchoamento em espuma oferece conforto duradouro.\n\nSom HiFi Bluetooth integrado na estrutura\nEmparelhe o seu dispositivo através do botão Bluetooth e ajuste separadamente volume, graves e agudos no painel lateral com interruptor e porta USB.\n\nRotação de 360° e malha 3D texturizada\nA base metálica de cinco pontas gira suavemente 360°. O tecido 3D mesh 77912 (100% poliéster, 530 g/m²) dá profundidade a cada curva. Acabamento: ${info.por} (código ${cCode}).\n\nEm resumo\n• Conjunto: poltrona lounge com pufe redondo a condizer\n• Designer: JF Rolet, Paris (modelo LN6789)\n• Dimensões da poltrona (L × P × A): 114 × 104 × 135 cm\n• Estrutura: armação interna em aço com acolchoamento em espuma\n• Base: base metálica de 5 braços com rotação de 360°\n• Áudio: sistema HiFi Bluetooth integrado (volume, graves, agudos, USB)\n• Estofo: malha 3D texturizada 77912 (100% poliéster) – ${info.por} (${cCode})\n\nConfirme a amostra de tecido escolhida antes de encomendar. As fotografias mostram acabamentos de referência.`,
  };

  return {
    name_en: localizedNames.en,
    name_us: localizedNames.us,
    name_de: localizedNames.de,
    name_fr: localizedNames.fr,
    name_es: localizedNames.es,
    name_it: localizedNames.it,
    name_por: localizedNames.por,
    name_pt: localizedNames.por,
    description_en: row.description_en || row.description || "",
    description_us: row.description_us || row.description_en || "",
    description_de: desc.de,
    description_fr: desc.fr,
    description_es: desc.es,
    description_it: desc.it,
    description_por: desc.por,
    description_pt: desc.por,
    extended_description_en: row.extended_description_en || "",
    extended_description_us: row.extended_description_us || row.extended_description_en || "",
    extended_description_de: ext.de,
    extended_description_fr: ext.fr,
    extended_description_es: ext.es,
    extended_description_it: ext.it,
    extended_description_por: ext.por,
    extended_description_pt: ext.por,
  };
}

// ── BUILD VARIANTS ──────────────────────────────────────────────────────────
let nextId = 404;
const variants = [];

const seriesFlagshipSlug = {
  V5: "sileopod-v5-acoustic-booth",
  V4: "sileopod-v4-acoustic-booth",
  UI1: "sileopod-ui1-acoustic-booth",
};

for (const row of pods) {
  const model = row.manufacturer_sku; // e.g. V5-S, UI1-XL
  const series = row.type; // V5 | V4 | UI1
  const meta = POD_MODEL_META[model] || { sizeCode: "S", capacity: 1, internal: "" };
  const colorRaw = row.color || "White (RAL 9003)";
  const colorInfo = RAL_COLORS[colorRaw] || {
    code: "0000",
    hex: "#CCCCCC",
    en: colorRaw,
    us: colorRaw,
    de: colorRaw,
    fr: colorRaw,
    es: colorRaw,
    it: colorRaw,
    por: colorRaw,
  };
  const isXL = model === "UI1-XL";
  const imgAsset = imageByModel.get(model);
  const img1k = imgAsset ? imgAsset["1K"].url : "";
  const img2k = imgAsset ? imgAsset["2K"].url : "";

  const sizeLabel =
    meta.sizeCode === "S"
      ? `S (1 Person – ${Math.round(Number(row.width) / 10)}×${Math.round(Number(row.length) / 10)} cm)`
      : meta.sizeCode === "M"
      ? `M (2 People – ${Math.round(Number(row.width) / 10)}×${Math.round(Number(row.length) / 10)} cm)`
      : meta.sizeCode === "L"
      ? `L (4 People – ${Math.round(Number(row.width) / 10)}×${Math.round(Number(row.length) / 10)} cm)`
      : "XL (Large Format)";

  const localized = buildPodLocalizedFields(row, model, series, colorInfo);

  // Each Pod size displays ONLY its own model image (from the spreadsheet)
  const orderedGallery = img2k ? [img2k] : [];

  variants.push({
    id: nextId++,
    sku: `SIL-${model.replace("-", "")}-${colorInfo.code}`,
    manufacturer_sku: model,
    name: row.name,
    slug: row.slug,
    parent_slug: seriesFlagshipSlug[series],
    category: "Acoustic Pods",
    parent_category: "acoustic-booths",
    sub_category: series,
    type: series,
    model_size: meta.sizeCode,
    capacity: meta.capacity,
    size: sizeLabel,
    sizeLabel,
    size_eu: sizeLabel,
    size_us: sizeLabel,
    sizeSlug: model.toLowerCase(),
    color: colorRaw,
    color_hex: colorInfo.hex,
    color_code: `RAL ${colorInfo.code}`,
    width: row.width ? Number(row.width) : null,
    length: row.length ? Number(row.length) : null,
    height: row.height ? Number(row.height) : null,
    weight: row.weight ? Number(row.weight) : null,
    internal_dimensions: meta.internal || null,
    stock: 0,
    price_gbp: 0,
    price_euro: 0,
    price_usd: 0,
    visibility: isXL ? "Hidden" : "Visible",
    is_visible: !isXL,
    is_unlisted: true,
    is_coming_soon: true,
    coming_soon_month: "January",
    tags: ["coming-in-january"],
    available_locales: ["en", "us", "de", "fr", "es", "por", "it"],
    image: img1k,
    hover_image: img1k,
    hoverImage: img1k,
    product_images: orderedGallery,
    gallery: orderedGallery.map((src, i) => ({
      src,
      alt: `${row.name} - View ${i + 1}`,
    })),
    product_image_alt: row.product_image_alt || row.name,
    meta_title: row.meta_title || row.name,
    meta_description: row.meta_description || localized.description_en.slice(0, 155),
    description: localized.description_en,
    ...localized,
  });
}

// Moonchair variants (24 colors)
const moon1kPrimary = moonImages[0]?.urls?.["1K"]?.url || "";
const moon1kHover = moonImages[1]?.urls?.["1K"]?.url || moon1kPrimary;
const moon2kGallery = moonImages.map((m) => m.urls["2K"].url);

for (const row of moons) {
  const colorRaw = row.color || "Orange (77912-03)";
  const info = MOON_COLORS[colorRaw] || {
    code: "00",
    hex: "#C87A4B",
    de: colorRaw,
    fr: colorRaw,
    es: colorRaw,
    it: colorRaw,
    por: colorRaw,
  };
  const localized = buildMoonLocalizedFields(row, colorRaw, info);

  variants.push({
    id: nextId++,
    sku: `MOON-LN6789-${info.code}`,
    manufacturer_sku: "LN6789",
    name: row.name,
    slug: row.slug,
    parent_slug: "moonchair-bluetooth-lounge-chair",
    category: "Moonchair",
    parent_category: "moonchair",
    sub_category: "Bluetooth Lounge Chair",
    type: "Lounge Chair & Ottoman Set",
    size: "114 × 104 × 135 cm",
    sizeLabel: "114 × 104 × 135 cm (Chair + Ottoman)",
    size_eu: "114 × 104 × 135 cm",
    size_us: '44.9" × 40.9" × 53.1"',
    sizeSlug: `ln6789-${info.code}`,
    color: colorRaw,
    color_hex: info.hex,
    color_code: `77912-${info.code}`,
    width: 1140,
    length: 1040,
    height: 1350,
    package_dimensions: row.package_dimensions || "",
    stock: 0,
    price_gbp: 0,
    price_euro: 0,
    price_usd: 0,
    visibility: "Visible",
    is_visible: true,
    is_unlisted: true,
    is_coming_soon: true,
    coming_soon_month: "January",
    tags: ["coming-in-january"],
    available_locales: ["en", "us", "de", "fr", "es", "por", "it"],
    image: moon1kPrimary,
    hover_image: moon1kHover,
    hoverImage: moon1kHover,
    product_images: moon2kGallery,
    gallery: moon2kGallery.map((src, i) => ({
      src,
      alt: `Moonchair Bluetooth Swivel Lounge Chair & Ottoman - View ${i + 1}`,
    })),
    product_image_alt: row.product_image_alt || row.name,
    meta_title: row.meta_title || row.name,
    meta_description: row.meta_description || localized.description_en.slice(0, 155),
    description: localized.description_en,
    ...localized,
  });
}

// ── BUILD 4 FLAGSHIPS ───────────────────────────────────────────────────────
const podSeriesFlagshipDefs = [
  {
    series: "V5",
    id: "flagship-acoustic-booth-v5",
    rawId: "acoustic-booth-v5",
    slug: "sileopod-v5-acoustic-booth",
    title: "Sileopod V5 Acoustic Booth",
    badge: "Coming in January • 32 dB",
    names: {
      en: "Sileopod V5 Acoustic Booth",
      us: "Sileopod V5 Acoustic Booth",
      de: "Sileopod V5 Akustikkabine",
      fr: "Cabine Acoustique Sileopod V5",
      es: "Cabina Acústica Sileopod V5",
      it: "Cabina Acustica Sileopod V5",
      por: "Cabine Acústica Sileopod V5",
    },
    sizeLabel: "S (1 Person) · M (2 People) · L (4 People)",
  },
  {
    series: "V4",
    id: "flagship-acoustic-booth-v4",
    rawId: "acoustic-booth-v4",
    slug: "sileopod-v4-acoustic-booth",
    title: "Sileopod V4 Acoustic Booth",
    badge: "Coming in January • 32 dB",
    names: {
      en: "Sileopod V4 Acoustic Booth",
      us: "Sileopod V4 Acoustic Booth",
      de: "Sileopod V4 Akustikkabine",
      fr: "Cabine Acoustique Sileopod V4",
      es: "Cabina Acústica Sileopod V4",
      it: "Cabina Acustica Sileopod V4",
      por: "Cabine Acústica Sileopod V4",
    },
    sizeLabel: "S (1 Person) · M (2 People) · L (4 People)",
  },
  {
    series: "UI1",
    id: "flagship-acoustic-booth-ui1",
    rawId: "acoustic-booth-ui1",
    slug: "sileopod-ui1-acoustic-booth",
    title: "Sileopod UI1 Acoustic Booth",
    badge: "Coming in January • Carbon Acoustic",
    names: {
      en: "Sileopod UI1 Acoustic Booth",
      us: "Sileopod UI1 Acoustic Booth",
      de: "Sileopod UI1 Akustikkabine",
      fr: "Cabine Acoustique Sileopod UI1",
      es: "Cabina Acústica Sileopod UI1",
      it: "Cabina Acustica Sileopod UI1",
      por: "Cabine Acústica Sileopod UI1",
    },
    sizeLabel: "S (1 Person) · M (2 People) · L (4 People)",
  },
];

const flagships = podSeriesFlagshipDefs.map((def) => {
  const sample = variants.find(
    (v) => v.parent_category === "acoustic-booths" && v.type === def.series && v.is_visible
  );
  const s1k = imageByModel.get(`${def.series}-S`)?.["1K"]?.url || "";
  const s2k = imageByModel.get(`${def.series}-S`)?.["2K"]?.url || "";
  const m1k = imageByModel.get(`${def.series}-M`)?.["1K"]?.url || s1k;
  const gallery2k = s2k ? [s2k] : [];

  return {
    id: def.id,
    rawId: def.rawId,
    title: def.title,
    name: def.title,
    name_en: def.names.en,
    name_us: def.names.us,
    name_de: def.names.de,
    name_fr: def.names.fr,
    name_es: def.names.es,
    name_it: def.names.it,
    name_por: def.names.por,
    name_pt: def.names.por,
    slug: def.slug,
    parent_category: "acoustic-booths",
    category: "Acoustic Pods",
    categoryKey: "acoustic-booths",
    type: def.series,
    sub_category: def.series,
    size: def.sizeLabel,
    sizeLabel: def.sizeLabel,
    badge: def.badge,
    colors: Object.values(RAL_COLORS).map((c) => c.hex),
    price_gbp: 0,
    price_euro: 0,
    price_usd: 0,
    numericPrice: 0,
    price: "Coming in January",
    stock: 0,
    visibility: "Visible",
    is_visible: true,
    is_unlisted: true,
    is_coming_soon: true,
    coming_soon_month: "January",
    tags: ["coming-in-january"],
    available_locales: ["en", "us", "de", "fr", "es", "por", "it"],
    image: s1k,
    hover_image: m1k,
    hoverImage: m1k,
    product_images: gallery2k,
    gallery: gallery2k.map((src, i) => ({ src, alt: `${def.title} - View ${i + 1}` })),
    description: sample?.description_en || "",
    description_en: sample?.description_en || "",
    description_us: sample?.description_us || "",
    description_de: sample?.description_de || "",
    description_fr: sample?.description_fr || "",
    description_es: sample?.description_es || "",
    description_it: sample?.description_it || "",
    description_por: sample?.description_por || "",
    description_pt: sample?.description_pt || "",
    extended_description_en: sample?.extended_description_en || "",
    extended_description_us: sample?.extended_description_us || "",
    extended_description_de: sample?.extended_description_de || "",
    extended_description_fr: sample?.extended_description_fr || "",
    extended_description_es: sample?.extended_description_es || "",
    extended_description_it: sample?.extended_description_it || "",
    extended_description_por: sample?.extended_description_por || "",
    extended_description_pt: sample?.extended_description_pt || "",
    link: `/products/acoustic-booths/${def.slug}`,
  };
});

// Moonchair flagship
const sampleMoon = variants.find((v) => v.parent_category === "moonchair");
flagships.push({
  id: "flagship-moonchair",
  rawId: "moonchair-ln6789",
  title: "Moonchair – Bluetooth Swivel Lounge Chair & Ottoman",
  name: "Moonchair – Bluetooth Swivel Lounge Chair & Ottoman",
  name_en: "Moonchair – Bluetooth Swivel Lounge Chair & Ottoman",
  name_us: "Moonchair – Bluetooth Swivel Lounge Chair & Ottoman",
  name_de: "Moonchair – Bluetooth-Drehsessel mit Hocker",
  name_fr: "Moonchair – Fauteuil Lounge Pivotant Bluetooth & Pouf",
  name_es: "Moonchair – Sillón Giratorio Bluetooth con Otomana",
  name_it: "Moonchair – Poltrona Lounge Girevole Bluetooth con Pouf",
  name_por: "Moonchair – Poltrona Giratória Bluetooth com Pufe",
  name_pt: "Moonchair – Poltrona Giratória Bluetooth com Pufe",
  slug: "moonchair-bluetooth-lounge-chair",
  aliases: ["moonchair", "ln6789"],
  parent_category: "moonchair",
  category: "Moonchair",
  categoryKey: "moonchair",
  type: "Lounge Chair & Ottoman Set",
  sub_category: "Bluetooth Lounge Chair",
  size: "114 × 104 × 135 cm",
  sizeLabel: "114 × 104 × 135 cm • 24 Colours",
  badge: "Coming in January • Bluetooth HiFi",
  colors: Object.values(MOON_COLORS).slice(0, 8).map((c) => c.hex),
  price_gbp: 0,
  price_euro: 0,
  price_usd: 0,
  numericPrice: 0,
  price: "Coming in January",
  stock: 0,
  visibility: "Visible",
  is_visible: true,
  is_unlisted: true,
  is_coming_soon: true,
  coming_soon_month: "January",
  tags: ["coming-in-january"],
  available_locales: ["en", "us", "de", "fr", "es", "por", "it"],
  image: moon1kPrimary,
  hover_image: moon1kHover,
  hoverImage: moon1kHover,
  product_images: moon2kGallery,
  gallery: moon2kGallery.map((src, i) => ({
    src,
    alt: `Moonchair Bluetooth Swivel Lounge Chair & Ottoman - View ${i + 1}`,
  })),
  description: sampleMoon?.description_en || "",
  description_en: sampleMoon?.description_en || "",
  description_us: sampleMoon?.description_us || "",
  description_de: sampleMoon?.description_de || "",
  description_fr: sampleMoon?.description_fr || "",
  description_es: sampleMoon?.description_es || "",
  description_it: sampleMoon?.description_it || "",
  description_por: sampleMoon?.description_por || "",
  description_pt: sampleMoon?.description_pt || "",
  extended_description_en: sampleMoon?.extended_description_en || "",
  extended_description_us: sampleMoon?.extended_description_us || "",
  extended_description_de: sampleMoon?.extended_description_de || "",
  extended_description_fr: sampleMoon?.extended_description_fr || "",
  extended_description_es: sampleMoon?.extended_description_es || "",
  extended_description_it: sampleMoon?.extended_description_it || "",
  extended_description_por: sampleMoon?.extended_description_por || "",
  extended_description_pt: sampleMoon?.extended_description_pt || "",
  link: `/products/moonchair/moonchair-bluetooth-lounge-chair`,
});

const output = {
  flagships,
  variants,
  colorPalettes: {
    ral: RAL_COLORS,
    moonchair: MOON_COLORS,
  },
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(
  `Wrote ${OUT_PATH}: ${flagships.length} flagships, ${variants.length} variants (${
    variants.filter((v) => !v.is_visible).length
  } hidden UI1-XL variants)`
);
