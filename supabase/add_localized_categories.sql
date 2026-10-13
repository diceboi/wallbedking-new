-- ====================================================================
-- WALLBEDKING DATABASE MIGRATION: Add Localized Category Titles & Descriptions
-- ====================================================================
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. Add multilingual title and description columns to public.categories
ALTER TABLE public.categories
  -- Localized Titles
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_us TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_por TEXT,
  ADD COLUMN IF NOT EXISTS title_pt TEXT,
  ADD COLUMN IF NOT EXISTS title_it TEXT,

  -- Localized Names (aliases)
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_us TEXT,
  ADD COLUMN IF NOT EXISTS name_de TEXT,
  ADD COLUMN IF NOT EXISTS name_fr TEXT,
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS name_por TEXT,
  ADD COLUMN IF NOT EXISTS name_pt TEXT,
  ADD COLUMN IF NOT EXISTS name_it TEXT,

  -- Localized Descriptions
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_us TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_por TEXT,
  ADD COLUMN IF NOT EXISTS description_pt TEXT,
  ADD COLUMN IF NOT EXISTS description_it TEXT;

-- 2. Populate / Update MORPHY™ Beds
UPDATE public.categories
SET
  title_en = 'MORPHY™ Beds',
  title_us = 'MORPHY™ Wall Beds',
  title_de = 'MORPHY™ Schrankbetten',
  title_fr = 'Lits Escamotables MORPHY™',
  title_es = 'Camas Abatibles MORPHY™',
  title_por = 'Camas Rebatíveis MORPHY™',
  title_pt = 'Camas Rebatíveis MORPHY™',
  title_it = 'Letti a Scomparsa MORPHY™',
  name_en = 'MORPHY™ Beds',
  name_us = 'MORPHY™ Wall Beds',
  name_de = 'MORPHY™ Schrankbetten',
  name_fr = 'Lits Escamotables MORPHY™',
  name_es = 'Camas Abatibles MORPHY™',
  name_por = 'Camas Rebatíveis MORPHY™',
  name_pt = 'Camas Rebatíveis MORPHY™',
  name_it = 'Letti a Scomparsa MORPHY™',
  description_en = 'Next-generation MORPHY™ foldaway wall beds engineered with precision German gas pistons and integrated comfort.',
  description_us = 'Next-generation MORPHY™ foldaway wall beds engineered with precision German gas struts and seamless living comfort.',
  description_de = 'MORPHY™ Schrankbetten der nächsten Generation mit präzisen deutschen Gasdruckfedern und integriertem Schlafkomfort.',
  description_fr = 'Lits escamotables MORPHY™ nouvelle génération dotés de pistons à gaz de précision et d''un confort intégré.',
  description_es = 'Camas abatibles MORPHY™ de última generación equipadas con pistones de gas de precisión y confort integrado.',
  description_por = 'Camas rebatíveis MORPHY™ de última geração concebidas com pistões a gás de precisão e conforto integrado.',
  description_pt = 'Camas rebatíveis MORPHY™ de última geração concebidas com pistões a gás de precisão e conforto integrado.',
  description_it = 'Letti a scomparsa MORPHY™ di nuova generazione dotati di pistoni a gas di precisione e massimo comfort integrato.'
WHERE id = 'morphy-beds';

-- 3. Populate / Update Traditional Beds
UPDATE public.categories
SET
  title_en = 'Traditional Beds',
  title_us = 'Traditional Wall Beds',
  title_de = 'Klassische Schrankbetten',
  title_fr = 'Lits Escamotables Traditionnels',
  title_es = 'Camas Abatibles Tradicionales',
  title_por = 'Camas Rebatíveis Tradicionais',
  title_pt = 'Camas Rebatíveis Tradicionais',
  title_it = 'Letti a Scomparsa Tradizionali',
  name_en = 'Traditional Beds',
  name_us = 'Traditional Wall Beds',
  name_de = 'Klassische Schrankbetten',
  name_fr = 'Lits Escamotables Traditionnels',
  name_es = 'Camas Abatibles Tradicionales',
  name_por = 'Camas Rebatíveis Tradicionais',
  name_pt = 'Camas Rebatíveis Tradicionais',
  name_it = 'Letti a Scomparsa Tradizionali',
  description_en = 'Time-tested Traditional wall beds with proven mechanism and solid engineering.',
  description_us = 'Time-tested Traditional wall beds with proven mechanism and heavy-duty steel engineering.',
  description_de = 'Bewährte traditionelle Schrankbetten mit solider Klappmechanik und langlebiger Ingenieurskunst.',
  description_fr = 'Lits escamotables traditionnels éprouvés avec mécanisme fiable et structure robuste.',
  description_es = 'Camas abatibles tradicionales de probada eficacia con mecanismo fiable y sólida ingeniería.',
  description_por = 'Camas rebatíveis tradicionais comprovadas com mecanismo fiável e engenharia robusta.',
  description_pt = 'Camas rebatíveis tradicionais comprovadas com mecanismo fiável e engenharia robusta.',
  description_it = 'Letti a scomparsa tradizionali collaudati con meccanismo affidabile e solida struttura in acciaio.'
WHERE id = 'traditional-beds';

-- 4. Populate / Update Cabinets
UPDATE public.categories
SET
  title_en = 'Cabinets',
  title_us = 'Cabinets & Storage',
  title_de = 'Schränke & Stauraum',
  title_fr = 'Armoires & Rangement',
  title_es = 'Armarios y Almacenamiento',
  title_por = 'Armários e Arrumação',
  title_pt = 'Armários e Arrumação',
  title_it = 'Armadi e Mobili',
  name_en = 'Cabinets',
  name_us = 'Cabinets & Storage',
  name_de = 'Schränke & Stauraum',
  name_fr = 'Armoires & Rangement',
  name_es = 'Armarios y Almacenamiento',
  name_por = 'Armários e Arrumação',
  name_pt = 'Armários e Arrumação',
  name_it = 'Armadi e Mobili',
  description_en = 'Matching modular wardrobes, shelving systems, and overhead bridge storage designed to complement wall bed finishes.',
  description_us = 'Matching modular wardrobes, shelving systems, and overhead bridge storage designed to complement wall beds.',
  description_de = 'Passende modulare Kleiderschränke, Regalsysteme und Überbauschränke, perfekt abgestimmt auf Ihr Schrankbett.',
  description_fr = 'Armoires modulaires, étagères et ponts de lit assortis conçus pour compléter vos lits escamotables.',
  description_es = 'Armarios modulares, estanterías y muebles puente diseñados para complementar los acabados de su cama abatible.',
  description_por = 'Roupeiros modulares, estantes e arrumação suspensa concebidos para complementar os acabamentos da sua cama rebatível.',
  description_pt = 'Roupeiros modulares, estantes e arrumação suspensa concebidos para complementar os acabamentos da sua cama rebatível.',
  description_it = 'Armadi modulari, librerie e ponti contenitore abbinati progettati per completare le finiture del vostro letto a scomparsa.'
WHERE id = 'cabinets';

-- 5. Populate / Update Mattresses
UPDATE public.categories
SET
  title_en = 'Mattresses',
  title_us = 'Mattresses',
  title_de = 'Matratzen',
  title_fr = 'Matelas',
  title_es = 'Colchones',
  title_por = 'Colchões',
  title_pt = 'Colchões',
  title_it = 'Materassi',
  name_en = 'Mattresses',
  name_us = 'Mattresses',
  name_de = 'Matratzen',
  name_fr = 'Matelas',
  name_es = 'Colchones',
  name_por = 'Colchões',
  name_pt = 'Colchões',
  name_it = 'Materassi',
  description_en = 'Rigorously tested orthopaedic memory foam and pocket sprung mattresses crafted for vertical storage.',
  description_us = 'Rigorously tested memory foam and pocket spring mattresses crafted for vertical wall bed storage.',
  description_de = 'Präzise getestete orthopädische Memory-Schaum- und Taschenfederkernmatratzen, optimiert für das vertikale Einklappen.',
  description_fr = 'Matelas orthopédiques à mémoire de forme et ressorts ensachés rigoureusement testés pour le stockage vertical.',
  description_es = 'Colchones ortopédicos de viscoelástica y muelles ensacados rigurosamente testados para almacenamiento vertical.',
  description_por = 'Colchões ortopédicos de viscoelástica e molas ensacadas rigorosamente testados para arrumação vertical.',
  description_pt = 'Colchões ortopédicos de viscoelástica e molas ensacadas rigorosamente testados para arrumação vertical.',
  description_it = 'Materassi ortopedici in memory foam e molle insacchettate rigorosamente testati per la chiusura verticale.'
WHERE id = 'mattresses';

-- 6. Populate / Update Sofas
UPDATE public.categories
SET
  title_en = 'Front Sofas',
  title_us = 'Front Sofas',
  title_de = 'Frontsofas',
  title_fr = 'Canapés Intégrés',
  title_es = 'Sofás Frontales',
  title_por = 'Sofás Frontais',
  title_pt = 'Sofás Frontais',
  title_it = 'Divani Frontali',
  name_en = 'Front Sofas',
  name_us = 'Front Sofas',
  name_de = 'Frontsofas',
  name_fr = 'Canapés Intégrés',
  name_es = 'Sofás Frontales',
  name_por = 'Sofás Frontais',
  name_pt = 'Sofás Frontais',
  name_it = 'Divani Frontali',
  description_en = 'Modular sofas, chaise lounges, and ottomans engineered specifically to fit seamlessly in front of WallBedKing murphy beds.',
  description_us = 'Modular sofas and seating modules engineered specifically to fit in front of WallBedKing murphy beds.',
  description_de = 'Modulare Sofas und Polstermöbel, passgenau für die Platzierung vor WallBedKing Schrankbetten.',
  description_fr = 'Canapés modulaires et banquettes conçus spécifiquement pour s''intégrer devant les lits escamotables WallBedKing.',
  description_es = 'Sofás modulares y chaiselongues diseñados específicamente para encajar delante de las camas abatibles WallBedKing.',
  description_por = 'Sofás modulares e chaises longues concebidos especificamente para encaixar à frente das camas rebatíveis WallBedKing.',
  description_pt = 'Sofás modulares e chaises longues concebidos especificamente para encaixar à frente das camas rebatíveis WallBedKing.',
  description_it = 'Divani modulari e chaise longue progettati appositamente per integrarsi davanti ai letti a scomparsa WallBedKing.'
WHERE id = 'sofas';

-- 7. Populate / Update Tables
UPDATE public.categories
SET
  title_en = 'Smart Tables',
  title_us = 'Smart Tables & Desks',
  title_de = 'Smarte Tische',
  title_fr = 'Tables Intelligentes',
  title_es = 'Mesas Inteligentes',
  title_por = 'Mesas Inteligentes',
  title_pt = 'Mesas Inteligentes',
  title_it = 'Tavoli Intelligenti',
  name_en = 'Smart Tables',
  name_us = 'Smart Tables & Desks',
  name_de = 'Smarte Tische',
  name_fr = 'Tables Intelligentes',
  name_es = 'Mesas Inteligentes',
  name_por = 'Mesas Inteligentes',
  name_pt = 'Mesas Inteligentes',
  name_it = 'Tavoli Intelligenti',
  description_en = 'Multifunctional, height-adjustable, drop-leaf and extending tables engineered for compact living.',
  description_us = 'Multifunctional, height-adjustable, and space-saving tables engineered for modern homes.',
  description_de = 'Multifunktionale, höhenverstellbare und ausziehbare Tische für kompaktes und flexibles Wohnen.',
  description_fr = 'Tables multifonctions, réglables en hauteur et extensibles conçues pour les espaces compacts.',
  description_es = 'Mesas multifuncionales, regulables en altura y extensibles diseñadas para espacios reducidos.',
  description_por = 'Mesas multifuncionais, de altura ajustável e extensíveis concebidas para espaços compactos.',
  description_pt = 'Mesas multifuncionais, de altura ajustável e extensíveis concebidas para espaços compactos.',
  description_it = 'Tavoli multifunzione, regolabili in altezza ed estensibili progettati per spazi compatti.'
WHERE id = 'tables';

-- 8. Populate / Update Extras / Accessories
UPDATE public.categories
SET
  title_en = 'Accessories & Extras',
  title_us = 'Accessories & Extras',
  title_de = 'Zubehör & Extras',
  title_fr = 'Accessoires & Extras',
  title_es = 'Accesorios y Extras',
  title_por = 'Acessórios e Extras',
  title_pt = 'Acessórios e Extras',
  title_it = 'Accessori ed Extra',
  name_en = 'Accessories & Extras',
  name_us = 'Accessories & Extras',
  name_de = 'Zubehör & Extras',
  name_fr = 'Accessoires & Extras',
  name_es = 'Accesorios y Extras',
  name_por = 'Acessórios e Extras',
  name_pt = 'Acessórios e Extras',
  name_it = 'Accessori ed Extra',
  description_en = 'Integrated dual LED reading lights, recessed USB-C fast charging stations, headboards, and mattress retaining straps.',
  description_us = 'Integrated dual LED reading lights, recessed USB-C ports, and mattress retaining straps.',
  description_de = 'Integrierte duale LED-Leselampen, versenkte USB-C Ladebuchsen und Matratzen-Haltegurte.',
  description_fr = 'Liseuses LED intégrées, ports de charge rapide USB-C encastrés et sangles de maintien.',
  description_es = 'Luces de lectura LED integradas, puertos de carga rápida USB-C y correas de sujeción de colchón.',
  description_por = 'Luzes de leitura LED integradas, portas USB-C de carregamento rápido e cintas de fixação de colchão.',
  description_pt = 'Luzes de leitura LED integradas, portas USB-C de carregamento rápido e cintas de fixação de colchão.',
  description_it = 'Luci di lettura a LED integrate, porte di ricarica rapida USB-C e cinghie di fissaggio del materasso.'
WHERE id = 'extras';
