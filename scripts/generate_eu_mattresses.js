const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'src', 'data', 'products-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// 1. Update existing UK mattresses (183 to 194)
catalog.forEach(item => {
  if (item.id >= 183 && item.id <= 194) {
    item.available_locales = ['en'];
    item.sale_percent = null;
    item.sale_fix_gbp = null;
    item.sale_fix_euro = null;
    item.sale_fix_usd = null;
    item.sale_price_gbp = null;
    item.sale_price_euro = null;
    item.sale_price_usd = null;
  }
});

// Remove existing 237-251 if any
const cleanCatalog = catalog.filter(item => item.id < 237 || item.id > 251);

const types = [
  {
    type: 'Comfort',
    depth: 200,
    image: 'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/mattresses/comfort.webp',
    prices: { '90x200': 499, '120x200': 529, '140x200': 529, '160x200': 599, '180x200': 649 },
    desc: {
      en: 'Our WBK Comfort Mattress features an 8” (20cm) depth profile with a 2” layer of pressure-relieving memory foam and a high-density reflex base for everyday support.',
      de: 'Unsere WBK Comfort Matratze bietet eine Gesamthöhe von 20 cm mit 50 mm Memory-Schaum und einem hochelastischen Kaltschaumkern für optimalen Liegekomfort im Schrankbett.',
      fr: 'Notre matelas WBK Comfort propose une épaisseur de 20 cm avec 50 mm de mousse à mémoire de forme et une base reflex haute densité pour un couchage quotidien.',
      es: 'Nuestro colchón WBK Comfort cuenta con 20 cm de grosor con 50 mm de espuma viscoelástica y núcleo de alta densidad para un descanso diario reparador.',
      por: 'O nosso colchão WBK Comfort tem 20 cm de espessura com 50 mm de espuma viscoelástica e base de alta densidade para conforto diário.',
      it: "Il nostro materasso WBK Comfort offre un'altezza di 20 cm con 50 mm di memory foam e base reflex ad alta densità per il riposo quotidiano nei letti a ribalta."
    },
    extDesc: {
      en: 'Engineered specifically for wall bed folding mechanics. Features a hypoallergenic zip-cover, optimal weight balance, and 1-year manufacturer warranty with 30-day trial guarantee.',
      de: 'Speziell auf Klappmechanismen abgestimmt. Mit hypoallergenem Reißverschlussbezug, optimaler Gewichtsbalance und 1 Jahr Herstellergarantie plus 30-Tage-Zufriedenheitsgarantie.',
      fr: 'Spécialement optimisé pour les mécanismes de lits escamotables. Housse hypoallergénique zippée, équilibre de poids parfait et garantie fabricant de 1 an avec essai de 30 jours.',
      es: 'Optimizado para mecanismos abatibles. Funda hipoalergénica con cremallera, equilibrio de peso ideal y 1 año de garantía del fabricante con prueba de 30 días.',
      por: 'Otimizado para mecanismos rebatíveis. Capa hipoalergénica com fecho, equilíbrio de peso ideal e 1 ano de garantia do fabricante com teste de 30 dias.',
      it: 'Ottimizzato per meccanismi a ribalta. Fodera anallergica con cerniera, perfetto bilanciamento del peso e 1 anno di garanzia con 30 giorni di prova.'
    }
  },
  {
    type: 'Luxury',
    depth: 250,
    image: 'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/mattresses/luxury.webp',
    prices: { '90x200': 599, '120x200': 629, '140x200': 629, '160x200': 699, '180x200': 749 },
    desc: {
      en: 'The Luxury Mattress features a 10” (25cm) thickness profile combining a generous 3” layer of pressure-relieving memory foam with a high-resilience reflex foam base. Engineered for medium-firm orthopaedic support and restorative everyday sleep.',
      de: 'Die WBK Luxury Matratze bietet eine Gesamthöhe von 25 cm mit einer 75 mm Memory-Schaum-Schicht und einem mittelfesten orthopädischen Kaltschaumkern.',
      fr: 'Le matelas WBK Luxury offre une épaisseur de 25 cm combinant 75 mm de mousse à mémoire de forme avec une base reflex orthopédique haute résilience.',
      es: 'El colchón WBK Luxury cuenta con 25 cm de grosor combinando 75 mm de viscoelástica con un núcleo de espuma reflex ortopédico de firmeza media.',
      por: 'O colchão WBK Luxury tem 25 cm de espessura aliando uma camada de 75 mm de viscoelástica a uma base reflex ortopédica de firmeza média.',
      it: "Il materasso WBK Luxury offre un'altezza di 25 cm con uno strato da 75 mm di memory foam e una base reflex ortopedica a media rigidità."
    },
    extDesc: {
      en: 'Part of the official WBK Mattress Range, the Luxury Mattress delivers enhanced pressure distribution and targeted orthopaedic support. The combination of a 3” high-grade memory foam contouring topper and a solid reflex foam core ensures optimal spinal alignment and superior longevity for daily use.',
      de: 'Als Teil der offiziellen WBK Matratzen-Serie bietet die Luxury Matratze erstklassige Druckentlastung und punktgenaue Stützkraft. Die Kombination aus 75 mm Memory-Schaum und festem Kaltschaumkern garantiert gesunde Wirbelsäulenausrichtung.',
      fr: 'Faisant partie de la gamme officielle WBK, le matelas Luxury offre une répartition de pression supérieure et un soutien orthopédique ciblé pour un usage quotidien durable.',
      es: 'Como parte de la gama oficial WBK, el colchón Luxury ofrece una distribución de presión óptima y soporte ortopédico duradero para el descanso diario.',
      por: 'Parte da gama oficial WBK, o colchão Luxury oferece alívio de pressão ergonómico e apoio ortopédico duradouro.',
      it: 'Parte della gamma ufficiale WBK, il materasso Luxury offre un perfetto sollievo dalla pressione e un supporto ortopedico ideale per un uso quotidiano prolungato.'
    }
  },
  {
    type: 'Supreme',
    depth: 250,
    image: 'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/mattresses/supreme.webp',
    prices: { '90x200': 699, '120x200': 729, '140x200': 729, '160x200': 799, '180x200': 849 },
    desc: {
      en: 'Our pinnacle sleep experience. The Supreme Mattress features a 10” (25cm) thickness profile combining 1,500 individual pocket springs with pressure-relieving memory foam and Motion Isolation Technology™ to eliminate partner disturbance.',
      de: 'Die WBK Supreme Matratze bietet ein 25 cm Hybrid-Profil mit 1.500 einzeln verpackten Tonnentaschenfedern, Memory-Schaum und Motion Isolation Technology™.',
      fr: 'Le matelas WBK Supreme propose un profil hybride de 25 cm avec 1 500 ressorts ensachés individuels, mousse viscoélastique et technologie Motion Isolation™.',
      es: 'El colchón WBK Supreme cuenta con un perfil híbrido de 25 cm con 1.500 muelles ensacados, espuma viscoelástica y tecnología Motion Isolation™.',
      por: 'O colchão WBK Supreme apresenta um perfil híbrido de 25 cm com 1.500 molas ensacadas individuais, viscoelástica e Motion Isolation Technology™.',
      it: 'Il materasso WBK Supreme offre un profilo ibrido di 25 cm con 1.500 molle insacchettate indipendenti, memory foam e tecnologia Motion Isolation™.'
    },
    extDesc: {
      en: 'The pinnacle of our mattress collection. The Supreme Mattress combines the responsive adaptability of 1,500 individual pocket springs with a plush memory foam layer and Motion Isolation Technology™, ensuring completely undisturbed rest.',
      de: 'Das Spitzenmodell unserer Kollektion: 1.500 Taschenfedern reagieren punktgenau auf jede Bewegung, während anschmiegsamer Memory-Schaum sanft Druck von Gelenken und Rücken nimmt.',
      fr: 'Le sommet de notre collection : 1 500 ressorts ensachés associés à la mousse à mémoire de forme pour un confort absolu et une indépendance de couchage totale.',
      es: 'La cumbre de nuestra colección: 1.500 muelles ensacados combinados con viscoelástica para una perfecta independencia de lechos y descanso reparador.',
      por: 'O topo da nossa coleção: 1.500 molas ensacadas individuais aliadas a viscoelástica para total independência de movimentos.',
      it: 'Il fiore all’occhiello della collezione: 1.500 molle insacchettate combinate con memory foam per un comfort impareggiabile e totale isolamento dei movimenti.'
    }
  }
];

const sizes = [
  {
    key: '90x200',
    w: 900,
    l: 2000,
    names: {
      en: 'Single {TYPE} Mattress',
      de: 'Einzelbett {TYPE} Matratze',
      fr: 'Matelas Simple {TYPE_FR}',
      es: 'Colchón Individual {TYPE}',
      por: 'Colchão Solteiro {TYPE}',
      it: 'Materasso Singolo {TYPE}'
    }
  },
  {
    key: '120x200',
    w: 1200,
    l: 2000,
    names: {
      en: 'Small Double {TYPE} Mattress',
      de: 'Small Double {TYPE} Matratze',
      fr: 'Matelas Petit Double {TYPE_FR}',
      es: 'Colchón Plaza y Media {TYPE}',
      por: 'Colchão Casal Pequeno {TYPE}',
      it: 'Materasso Piazza e Mezza {TYPE}'
    }
  },
  {
    key: '140x200',
    w: 1400,
    l: 2000,
    names: {
      en: 'Double {TYPE} Mattress',
      de: 'Doppelbett {TYPE} Matratze',
      fr: 'Matelas Double {TYPE_FR}',
      es: 'Colchón Doble {TYPE}',
      por: 'Colchão Casal {TYPE}',
      it: 'Materasso Matrimoniale {TYPE}'
    }
  },
  {
    key: '160x200',
    w: 1600,
    l: 2000,
    names: {
      en: 'King {TYPE} Mattress',
      de: 'King {TYPE} Matratze',
      fr: 'Matelas Grand Double {TYPE_FR}',
      es: 'Colchón King {TYPE}',
      por: 'Colchão King {TYPE}',
      it: 'Materasso Matrimoniale King {TYPE}'
    }
  },
  {
    key: '180x200',
    w: 1800,
    l: 2000,
    names: {
      en: 'Super King {TYPE} Mattress',
      de: 'Super King {TYPE} Matratze',
      fr: 'Matelas Super King {TYPE_FR}',
      es: 'Colchón Super King {TYPE}',
      por: 'Colchão Super King {TYPE}',
      it: 'Materasso Super King {TYPE}'
    }
  }
];

const typeFr = {
  'Comfort': 'Confort',
  'Luxury': 'Luxe',
  'Supreme': 'Suprême'
};

let currentId = 237;
const newItems = [];
const sqlInserts = [];

types.forEach(t => {
  sizes.forEach(s => {
    const id = currentId++;
    const priceEuro = t.prices[s.key];
    const slug = `${s.names.en.replace('{TYPE}', t.type).toLowerCase().replace(/\s+/g, '-')}-${s.key}x${t.depth / 10}`;
    const nameEn = s.names.en.replace('{TYPE}', t.type);
    const nameDe = s.names.de.replace('{TYPE}', t.type);
    const nameFr = s.names.fr.replace('{TYPE_FR}', typeFr[t.type]);
    const nameEs = s.names.es.replace('{TYPE}', t.type);
    const namePor = s.names.por.replace('{TYPE}', t.type);
    const nameIt = s.names.it.replace('{TYPE}', t.type);

    const item = {
      id,
      sku: `MAT-${t.type.substring(0, 4).toUpperCase()}-${s.key}`,
      ean: null,
      ean_uk: null,
      ean_it: null,
      ean_de: null,
      ean_fr: null,
      ean_es: null,
      ean_pt: null,
      ean_us: null,
      name: nameEn,
      slug,
      width: s.w,
      length: s.l,
      height: t.depth,
      frame_width: null,
      folded_up_height: null,
      folded_up_projection: null,
      folded_down_projection: null,
      frame_distance_from_ground: null,
      mounting_frame_height: null,
      maximum_mattress_depth: null,
      orientation: 'Universal',
      type: t.type,
      color: 'White',
      weight: null,
      stock: 100,
      package_dimensions: null,
      pack_1: null,
      pack_2: null,
      pack_3: null,
      pack_4: null,
      price_gbp: null,
      price_euro: priceEuro,
      price_usd: null,
      sale_percent: null,
      sale_fix_gbp: null,
      sale_fix_euro: null,
      sale_fix_usd: null,
      sale_price_gbp: null,
      sale_price_euro: null,
      sale_price_usd: null,
      category: `Mattresses > ${t.type}`,
      parent_category: 'mattresses',
      sub_category: t.type,
      backorder: true,
      visibility: 'Visible',
      warranty: '1 year for manufacturing defects',
      description: t.desc.en,
      image: t.image,
      hover_image: t.image,
      product_images: [t.image],
      product_image_alt: `${nameEn} ${s.key} White`,
      meta_title: `${nameEn} ${s.key}`,
      meta_description: t.desc.en,
      has_3d: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name_en: nameEn,
      name_us: null,
      name_de: nameDe,
      name_fr: nameFr,
      name_es: nameEs,
      name_por: namePor,
      name_it: nameIt,
      name_pt: namePor,
      gtin_en: null,
      gtin_us: null,
      gtin_de: null,
      gtin_fr: null,
      gtin_es: null,
      gtin_por: null,
      gtin_it: null,
      gtin_pt: null,
      installation_manual: null,
      installation_video: null,
      tags: [],
      available_locales: ['de', 'fr', 'es', 'por', 'it'],
      description_en: t.desc.en,
      description_us: null,
      description_de: t.desc.de,
      description_fr: t.desc.fr,
      description_es: t.desc.es,
      description_por: t.desc.por,
      description_pt: t.desc.por,
      description_it: t.desc.it,
      extended_description_en: t.extDesc.en,
      extended_description_us: null,
      extended_description_de: t.extDesc.de,
      extended_description_fr: t.extDesc.fr,
      extended_description_es: t.extDesc.es,
      extended_description_por: t.extDesc.por,
      extended_description_pt: t.extDesc.por,
      extended_description_it: t.extDesc.it,
      title_fr: nameFr
    };

    newItems.push(item);

    const escapeSql = (str) => {
      if (str === null || str === undefined) return 'NULL';
      return `'${String(str).replace(/'/g, "''")}'`;
    };

    sqlInserts.push(`(
  ${id},
  ${escapeSql(item.sku)},
  ${escapeSql(item.name)},
  ${escapeSql(item.slug)},
  ${item.width},
  ${item.length},
  ${item.height},
  'Universal',
  ${escapeSql(item.type)},
  'White',
  100,
  ${priceEuro},
  ${escapeSql(item.category)},
  'mattresses',
  ${escapeSql(item.sub_category)},
  true,
  'Visible',
  '1 year for manufacturing defects',
  ${escapeSql(item.description)},
  ${escapeSql(item.image)},
  ${escapeSql(item.hover_image)},
  ARRAY[${escapeSql(item.image)}],
  ${escapeSql(item.meta_title)},
  ${escapeSql(item.meta_description)},
  ARRAY['de', 'fr', 'es', 'por', 'it'],
  ${escapeSql(item.name_de)},
  ${escapeSql(item.name_fr)},
  ${escapeSql(item.name_es)},
  ${escapeSql(item.name_por)},
  ${escapeSql(item.name_it)},
  ${escapeSql(item.description_de)},
  ${escapeSql(item.description_fr)},
  ${escapeSql(item.description_es)},
  ${escapeSql(item.description_por)},
  ${escapeSql(item.description_it)},
  ${escapeSql(item.extended_description_de)},
  ${escapeSql(item.extended_description_fr)},
  ${escapeSql(item.extended_description_es)},
  ${escapeSql(item.extended_description_por)},
  ${escapeSql(item.extended_description_it)}
)`);
  });
});

cleanCatalog.push(...newItems);
fs.writeFileSync(catalogPath, JSON.stringify(cleanCatalog, null, 2));

const sqlMigrationContent = `-- ============================================================
-- SQL Migration: Add EU Mattress Variants & Update UK Mattresses
-- Generated for WallBedKing Storefront Market Segregation
-- ============================================================

-- 1. Segregate existing UK mattresses (IDs 183 to 194)
-- Set available_locales to UK only ('en') and clear all sale discounts (run at full base price)
UPDATE public.products
SET 
  available_locales = ARRAY['en'],
  sale_percent = NULL,
  sale_fix_gbp = NULL,
  sale_fix_euro = NULL,
  sale_fix_usd = NULL,
  sale_price_gbp = NULL,
  sale_price_euro = NULL,
  sale_price_usd = NULL,
  updated_at = NOW()
WHERE id BETWEEN 183 AND 194;

-- 2. Insert 15 EU Mattress Variants (IDs 237 to 251)
-- Available only in EU locales: de, fr, es, por, it
-- Base prices (full price, no discounts) from old WBK European catalog
INSERT INTO public.products (
  id,
  sku,
  name,
  slug,
  width,
  length,
  height,
  orientation,
  type,
  color,
  stock,
  price_euro,
  category,
  parent_category,
  sub_category,
  backorder,
  visibility,
  warranty,
  description,
  image,
  hover_image,
  product_images,
  meta_title,
  meta_description,
  available_locales,
  name_de,
  name_fr,
  name_es,
  name_por,
  name_it,
  description_de,
  description_fr,
  description_es,
  description_por,
  description_it,
  extended_description_de,
  extended_description_fr,
  extended_description_es,
  extended_description_por,
  extended_description_it
) VALUES
${sqlInserts.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  width = EXCLUDED.width,
  length = EXCLUDED.length,
  height = EXCLUDED.height,
  price_euro = EXCLUDED.price_euro,
  sale_percent = NULL,
  sale_price_euro = NULL,
  available_locales = EXCLUDED.available_locales,
  name_de = EXCLUDED.name_de,
  name_fr = EXCLUDED.name_fr,
  name_es = EXCLUDED.name_es,
  name_por = EXCLUDED.name_por,
  name_it = EXCLUDED.name_it,
  description_de = EXCLUDED.description_de,
  description_fr = EXCLUDED.description_fr,
  description_es = EXCLUDED.description_es,
  description_por = EXCLUDED.description_por,
  description_it = EXCLUDED.description_it,
  extended_description_de = EXCLUDED.extended_description_de,
  extended_description_fr = EXCLUDED.extended_description_fr,
  extended_description_es = EXCLUDED.extended_description_es,
  extended_description_por = EXCLUDED.extended_description_por,
  extended_description_it = EXCLUDED.extended_description_it,
  updated_at = NOW();
`;

fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'add_eu_mattresses.sql'), sqlMigrationContent);
console.log('Successfully updated products-catalog.json and created supabase/add_eu_mattresses.sql!');
