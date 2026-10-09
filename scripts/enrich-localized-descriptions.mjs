import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const catalogPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const TRANSLATIONS = {
  'beds | Vertical | Classic': {
    en: "The Classic Vertical Wall Bed is engineered for everyday durability. Designed with high-performance counterbalanced gas pistons and an all-steel reinforced frame for effortless folding.",
    de: "Das klassische vertikale Schrankbett ist für den täglichen Gebrauch konstruiert. Ausgestattet mit langlebigen Gasdruckfedern und einem verstärkten Ganzstahlrahmen für müheloses Auf- und Zuklappen.",
    fr: "Le lit escamotable vertical Classic est conçu pour un usage quotidien durable. Équipé de vérins à gaz haute performance et d'un cadre renforcé tout acier pour une ouverture sans effort.",
    es: "La cama abatible vertical Classic está diseñada para la máxima durabilidad diaria. Incorpora pistones de gas de alto rendimiento y estructura reforzada de acero para un abatimiento sin esfuerzo.",
    it: "Il letto a scomparsa verticale Classic è progettato per la massima durabilità quotidiana. Dotato di pistoni a gas ad alte prestazioni e telaio in acciaio rinforzato per un'apertura senza sforzo.",
    por: "A cama rebatível vertical Classic foi concebida para durabilidade diária. Equipada com pistões a gás de alto rendimento e estrutura reforçada totalmente em aço para uma abertura sem esforço.",
  },
  'beds | Horizontal | Classic': {
    en: "Ideal for rooms with low ceilings, lofts, or narrow floor plans. Folds down along its long side with whisper-quiet gas-assisted pistons to minimise ceiling height requirements.",
    de: "Ideal für Räume mit niedrigen Decken, Dachböden oder schmale Grundrisse. Klappt entlang der Längsseite herunter, um minimale Deckenhöhe zu beanspruchen – mit flüsterleiser Gasdruckunterstützung.",
    fr: "Idéal pour les pièces à faible hauteur sous plafond, les combles ou les espaces étroits. Se rabat le long de son grand côté grâce à une assistance à gaz silencieuse.",
    es: "Ideal para habitaciones con techos bajos, buhardillas o espacios estrechos. Se abate a lo largo de su lado mayor para requerir menor altura con suave asistencia de gas.",
    it: "Ideale per stanze con soffitti bassi, mansarde o spazi stretti. Si apre lungo il lato lungo per ridurre al minimo l'altezza richiesta, con pistoni a gas silenziosi.",
    por: "Ideal para divisões com tetos baixos, sótãos ou quartos estreitos. Rebate pelo lado mais comprido para minimizar a altura necessária com pistões a gás silenciosos.",
  },
  'beds | Vertical | Studio': {
    en: "The Studio Vertical Wall Bed features a front decorative panel, contemporary aesthetics, and smooth gas-assisted lifting. Perfect as a standalone statement wall bed.",
    de: "Das Studio vertikale Schrankbett verfügt über eine dekorative Frontplatte, moderne Ästhetik und sanfte Gasdruck-Hebeunterstützung. Perfekt als stilvolles Solitärmöbel.",
    fr: "Le lit escamotable vertical Studio est doté d'un panneau décoratif en façade, d'une esthétique contemporaine et d'un relevage assisté par vérins à gaz.",
    es: "La cama abatible vertical Studio cuenta con un panel frontal decorativo, estética moderna y suave elevación asistida por pistones de gas.",
    it: "Il letto a scomparsa verticale Studio presenta un pannello frontale decorativo, linee contemporanee e sollevamento assistito a gas fluido e sicuro.",
    por: "A cama rebatível vertical Studio inclui painel frontal decorativo, estética contemporânea e elevação suave com amortecedores a gás.",
  },
  'beds | Horizontal | Studio': {
    en: "Horizontal fold-down wall bed fitted with front decorative panels. The ideal space-saving sleeping solution for studio apartments and modern home offices.",
    de: "Horizontales Schrankbett mit dekorativer Frontplatte. Die ideale platzsparende Schlaflösung für Studio-Apartments und moderne Heimbüros.",
    fr: "Lit escamotable horizontal équipé d'un panneau frontal décoratif. La solution de couchage gain de place idéale pour les studios et les bureaux.",
    es: "Cama abatible horizontal equipada con panel frontal decorativo. La solución ideal para ahorrar espacio en estudios y oficinas modernas en casa.",
    it: "Letto a scomparsa orizzontale con pannello frontale decorativo. La soluzione salvaspazio perfetta per monolocali e uffici domestici moderni.",
    por: "Cama rebatível horizontal com painel frontal decorativo. A solução ideal para poupar espaço em apartamentos estúdio e escritórios contemporâneos.",
  },
  'beds | Vertical | Integrated': {
    en: "Engineered specifically to seamlessly fit inside custom cabinetry, bespoke wardrobes, and modular storage systems. Supports full 3D interactive customization.",
    de: "Speziell entwickelt für den nahtlosen Einbau in maßgefertigte Schränke, Einbauschränke und modulare Aufbewahrungssysteme. Unterstützt vollständige interaktive 3D-Konfiguration.",
    fr: "Spécifiquement conçu pour s'intégrer harmonieusement dans des armoires sur mesure et des dressings modulaires. Compatible avec la personnalisation 3D interactive.",
    es: "Diseñado específicamente para integrarse a la perfección en armarios a medida y sistemas modulares. Compatible con personalización interactiva en 3D.",
    it: "Progettato specificamente per integrarsi armoniosamente in armadi su misura e sistemi di arredo modulari. Supporta la configurazione interattiva 3D completa.",
    por: "Projetado especificamente para se integrar perfeitamente em armários sob medida e sistemas modulares. Suporta personalização interativa 3D completa.",
  },
  'beds | Horizontal | Integrated': {
    en: "Side-folding mechanism engineered for low-profile horizontal cabinetry, bookshelf integration, and low-ceiling built-ins with smooth counterbalanced pistons.",
    de: "Horizontal klappbarer Mechanismus, optimiert für flache Schrankkorpusse, Regaleinbauten und Einbaulösungen bei niedrigen Raumhöhen.",
    fr: "Mécanisme rabattable latéral conçu pour l'intégration dans des armoires basses, bibliothèques et espaces à faible hauteur sous plafond.",
    es: "Mecanismo de apertura lateral diseñado para armarios horizontales de perfil bajo, estanterías e instalaciones de poca altura.",
    it: "Meccanismo con apertura orizzontale laterale per mobili bassi, librerie a incasso e ambienti con soffitti ridotti.",
    por: "Mecanismo rebatível lateral projetado para armários horizontais de perfil baixo, estantes e instalações em tetos baixos.",
  },
  'sofas | Vertical | Bed Front': {
    en: "Engineered to sit directly in front of vertical WallBedKing wall beds. Folds flat effortlessly when the bed is lowered without needing to detach seat modules.",
    de: "Speziell entwickelt für die Platzierung vor vertikalen WallBedKing Schrankbetten. Senkt sich mühelos ab, wenn das Bett heruntergeklappt wird, ohne Module abnehmen zu müssen.",
    fr: "Conçu pour être installé directement devant les lits escamotables verticaux WallBedKing. S'abaisse en toute simplicité lorsque le lit est ouvert sans retirer les coussins.",
    es: "Diseñado para colocarse directamente delante de las camas abatibles verticales WallBedKing. Se abate fácilmente con la cama sin necesidad de desmontar módulos.",
    it: "Progettato per essere posizionato direttamente davanti ai letti a scomparsa verticali WallBedKing. Si appiattisce comodamente all'apertura del letto.",
    por: "Projetado para se posicionar à frente das camas rebatíveis verticais WallBedKing. Articula suavemente com a descida da cama sem desmontar os módulos.",
  },
  'sofas | Vertical | Free Standing': {
    en: "Modular free-standing sofa providing premium living room seating, adaptable configurations, and matching styling for space-saving interiors.",
    de: "Freistehendes modulares Sofa für erstklassigen Sitzkomfort im Wohnbereich, flexible Konfigurationen und abgestimmtes Design.",
    fr: "Canapé d'angle ou droit modulaire offrant un confort de salon haut de gamme, adaptable à vos dimensions.",
    es: "Sofá modular independiente con asientos de gran confort, configuraciones versátiles y diseño moderno.",
    it: "Divano modulare indipendente per un comfort living superiore, configurazioni versatili e linee eleganti.",
    por: "Sofá modular independente que oferece conforto premium na sala de estar e configurações adaptáveis.",
  },
  'mattresses | Vertical | Comfort': {
    en: "Our WBK Comfort Mattress features an 8” (20cm) depth profile with a 2” layer of pressure-relieving memory foam and a high-density reflex base for everyday support.",
    de: "Unsere WBK Comfort Matratze bietet eine Gesamthöhe von 20 cm mit 50 mm Memory-Schaum und einem hochelastischen Kaltschaumkern für optimalen Liegekomfort im Schrankbett.",
    fr: "Notre matelas WBK Comfort propose une épaisseur de 20 cm avec 50 mm de mousse à mémoire de forme et une base reflex haute densité pour un couchage quotidien.",
    es: "Nuestro colchón WBK Comfort cuenta con 20 cm de grosor con 50 mm de espuma viscoelástica y núcleo de alta densidad para un descanso diario reparador.",
    it: "Il nostro materasso WBK Comfort offre un'altezza di 20 cm con 50 mm di memory foam e base reflex ad alta densità per il riposo quotidiano nei letti a ribalta.",
    por: "O nosso colchão WBK Comfort tem 20 cm de espessura com 50 mm de espuma viscoelástica e base de alta densidade para conforto diário.",
  },
  'mattresses | Vertical | Luxury': {
    en: "The WBK Luxury Mattress features a 10” (25cm) profile combining a 3” layer of pressure-relieving memory foam with a high-resilience orthopaedic reflex foam base.",
    de: "Die WBK Luxury Matratze bietet eine Gesamthöhe von 25 cm mit einer 75 mm Memory-Schaum-Schicht und einem mittelfesten orthopädischen Kaltschaumkern.",
    fr: "Le matelas WBK Luxury offre une épaisseur de 25 cm combinant 75 mm de mousse à mémoire de forme avec une base reflex orthopédique haute résilience.",
    es: "El colchón WBK Luxury cuenta con 25 cm de grosor combinando 75 mm de viscoelástica con un núcleo de espuma reflex ortopédico de firmeza media.",
    it: "Il materasso WBK Luxury offre un'altezza di 25 cm con uno strato da 75 mm di memory foam e una base reflex ortopedica a media rigidità.",
    por: "O colchão WBK Luxury tem 25 cm de espessura aliando uma camada de 75 mm de viscoelástica a uma base reflex ortopédica de firmeza média.",
  },
  'mattresses | Vertical | Supreme': {
    en: "The WBK Supreme Mattress features a 10” (25cm) hybrid profile combining 1,500 individually wrapped pocket springs, memory foam, and Motion Isolation Technology™.",
    de: "Die WBK Supreme Matratze bietet ein 25 cm Hybrid-Profil mit 1.500 einzeln verpackten Tonnentaschenfedern, Memory-Schaum und Motion Isolation Technology™.",
    fr: "Le matelas WBK Supreme propose un profil hybride de 25 cm avec 1 500 ressorts ensachés individuels, mousse viscoélastique et technologie Motion Isolation™.",
    es: "El colchón WBK Supreme cuenta con un perfil híbrido de 25 cm con 1.500 muelles ensacados, espuma viscoelástica y tecnología Motion Isolation™.",
    it: "Il materasso WBK Supreme offre un profilo ibrido di 25 cm con 1.500 molle insacchettate indipendenti, memory foam e tecnologia Motion Isolation™.",
    por: "O colchão WBK Supreme apresenta um perfil híbrido de 25 cm com 1.500 molas ensacadas individuais, viscoelástica e Motion Isolation Technology™.",
  },
  'cabinets | Vertical | Cabinet': {
    en: "Our vertical cabinets are perfectly designed to encase and compliment the Classic Vertical wall beds. Keeps your bed, mattress and bedding neat, clean and dust-free with 170° opening doors.",
    de: "Unsere vertikalen Schränke sind perfekt darauf abgestimmt, die vertikalen Classic-Schrankbetten einzufassen. Hält Bett, Matratze und Bettwäsche staubfrei mit 170°-Weitwinkeltüren.",
    fr: "Nos armoires verticales sont spécialement conçues pour encadrer les lits escamotables verticaux Classic. Protègent votre lit et literie de la poussière avec des portes à 170°.",
    es: "Nuestros muebles verticales están diseñados para complementar las camas abatibles verticales Classic. Mantienen el colchón y la ropa de cama libres de polvo con puertas de 170°.",
    it: "I nostri mobili verticali sono progettati per contenere i letti a scomparsa verticali Classic. Mantengono materasso e biancheria protetti dalla polvere con ante apribili a 170°.",
    por: "Os nossos armários verticais foram concebidos para acolher as camas rebatíveis verticais Classic. Mantêm o colchão e a roupa de cama sem pó com portas de abertura a 170°.",
  },
  'cabinets | Horizontal | Cabinet': {
    en: "Horizontal cabinet enclosure engineered for horizontal Classic wall beds. Features 90-degree opening doors and a clean contemporary look for rooms with low ceilings.",
    de: "Horizontaler Schrankumbau für horizontale Classic-Schrankbetten. Ausgestattet mit 90-Grad-Türen und moderner Optik für Räume mit niedrigen Decken.",
    fr: "Armoire horizontale conçue pour les lits escamotables horizontaux Classic. Dotée de portes s'ouvrant à 90 degrés et idéale pour les pièces à faible hauteur sous plafond.",
    es: "Mueble envolvente horizontal para camas abatibles horizontales Classic. Dispone de puertas con apertura a 90 grados para habitaciones con techos bajos.",
    it: "Mobile contenitore orizzontale per letti a scomparsa orizzontali Classic. Dotato di ante con apertura a 90 gradi, perfetto per stanze con soffitti bassi.",
    por: "Armário envolvente horizontal para camas rebatíveis horizontais Classic. Portas com abertura a 90 graus, ideal para divisões com tetos baixos.",
  },
  'cabinets | Horizontal | Cabinet Extension': {
    en: "Top extension unit developed specifically for horizontal cabinets to make up the height difference and align seamlessly with side units.",
    de: "Oberer Schrankaufsatz speziell für horizontale Schränke, um den Höhenunterschied zu Seitenschränken perfekt auszugleichen.",
    fr: "Module supérieur rehausseur conçu pour aligner la hauteur de l'armoire horizontale avec les meubles latéraux.",
    es: "Módulo superior diseñado para igualar la altura del mueble horizontal con las unidades laterales.",
    it: "Modulo di rialzo superiore per allineare l'armadio orizzontale all'altezza delle colonne laterali.",
    por: "Módulo superior concebido para nivelar a altura do armário horizontal com os módulos laterais.",
  },
  'cabinets | Vertical | Side Unit': {
    en: "Modular side unit matching the height of vertical cabinets. Available with wardrobe door and hanging rail (90° opening) or open shelving.",
    de: "Modulares Seitenelement, abgestimmt auf die Schrankhöhe. Wahlweise mit Schranktür und Kleiderstange (90° Öffnung) oder offenen Regalböden.",
    fr: "Colonne latérale modulaire alignée sur la hauteur de l'armoire. Disponible avec porte penderie (ouverture 90°) ou étagères ouvertes.",
    es: "Módulo lateral que coincide con la altura de los armarios. Disponible con puerta de armario y barra de colgar (apertura 90°) o estantes abiertos.",
    it: "Colonna laterale modulaire coordinata all'altezza dell'armadio. Disponibile con anta guardaroba e barra appendiabiti (apertura 90°) o ripiani a giorno.",
    por: "Coluna lateral modular alinhada com a altura do armário. Disponível com porta e varão (abertura 90°) ou prateleiras abertas.",
  },
};

let enrichedCount = 0;
for (const p of catalog) {
  const groupKey = `${p.parent_category} | ${p.orientation} | ${p.type || p.sub_category}`;
  const t = TRANSLATIONS[groupKey];
  if (t) {
    p.description_en = t.en;
    p.description_us = t.en;
    p.description_de = t.de;
    p.description_fr = t.fr;
    p.description_es = t.es;
    p.description_por = t.por;
    p.description_pt = t.por;
    p.description_it = t.it;
    enrichedCount++;
  } else {
    p.description_en = p.description || "";
    p.description_us = p.description || "";
    p.description_de = p.description || "";
    p.description_fr = p.description || "";
    p.description_es = p.description || "";
    p.description_por = p.description || "";
    p.description_pt = p.description || "";
    p.description_it = p.description || "";
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Successfully enriched ${enrichedCount} products in products-catalog.json with localized descriptions!`);
