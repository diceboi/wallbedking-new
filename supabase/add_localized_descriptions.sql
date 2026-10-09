-- ====================================================================
-- SQL Migration: Add Localized Product Descriptions & Extended Descriptions
-- ====================================================================
-- Adds dedicated description columns for every supported market/language:
-- Locales: en (UK), us (US), de (Germany), fr (France), es (Spain), por/pt (Portugal), it (Italy)
--
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard).

ALTER TABLE public.products
  -- Primary Localized Descriptions per market
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_us TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_por TEXT,
  ADD COLUMN IF NOT EXISTS description_pt TEXT,
  ADD COLUMN IF NOT EXISTS description_it TEXT,

  -- Localized Extended Descriptions per market (for in-depth specs & materials)
  ADD COLUMN IF NOT EXISTS extended_description_en TEXT,
  ADD COLUMN IF NOT EXISTS extended_description_us TEXT,
  ADD COLUMN IF NOT EXISTS extended_description_de TEXT,
  ADD COLUMN IF NOT EXISTS extended_description_fr TEXT,
  ADD COLUMN IF NOT EXISTS extended_description_es TEXT,
  ADD COLUMN IF NOT EXISTS extended_description_por TEXT,
  ADD COLUMN IF NOT EXISTS extended_description_pt TEXT,
  ADD COLUMN IF NOT EXISTS extended_description_it TEXT;

-- --------------------------------------------------------------------
-- 1. Initialize English/Base descriptions where empty
-- --------------------------------------------------------------------
UPDATE public.products
SET 
  description_en = COALESCE(description_en, description),
  description_us = COALESCE(description_us, description_en, description),
  description_de = COALESCE(description_de, description),
  description_fr = COALESCE(description_fr, description),
  description_es = COALESCE(description_es, description),
  description_por = COALESCE(description_por, description_pt, description),
  description_pt = COALESCE(description_pt, description_por, description),
  description_it = COALESCE(description_it, description)
WHERE description IS NOT NULL;

-- --------------------------------------------------------------------
-- 2. Populate Standard Descriptions for Wall Beds by Category & Orientation
-- --------------------------------------------------------------------

-- Classic Vertical Wall Beds
UPDATE public.products
SET
  description_de = 'Das klassische vertikale MORPHY™ Schrankbett ist unser Klappbett-Mechanismus der nächsten Generation für den täglichen Gebrauch. Ausgestattet mit langlebigen Gasdruckfedern und einem verstärkten Ganzstahlrahmen.',
  description_fr = 'Le lit escamotable vertical classique MORPHY™ est notre mécanisme nouvelle génération conçu pour une utilisation quotidienne durable. Doté de pistons à gaz haute performance et d''un cadre renforcé tout acier.',
  description_es = 'La cama abatible vertical clásica MORPHY™ es nuestro mecanismo de última generación diseñado para el uso diario duradero. Equipada con pistones de gas de alto rendimiento y estructura reforzada de acero.',
  description_it = 'Il letto a scomparsa verticale classico MORPHY™ è il nostro meccanismo di nuova generazione progettato per la massima durabilità quotidiana. Dotato di pistoni a gas ad alte prestazioni e telaio in acciaio rinforzato.',
  description_por = 'A cama rebatível vertical clássica MORPHY™ é o nosso mecanismo de última geração projetado para durabilidade diária. Equipada com pistões a gás de alto desempenho e estrutura totalmente em aço reforçado.',
  description_pt = 'A cama rebatível vertical clássica MORPHY™ é o nosso mecanismo de última geração projetado para durabilidade diária. Equipada com pistões a gás de alto desempenho e estrutura totalmente em aço reforçado.'
WHERE parent_category = 'beds' 
  AND orientation = 'Vertical' 
  AND (type ILIKE '%classic%' OR sub_category ILIKE '%classic%')
  AND (description_de IS NULL OR description_de = description);

-- Classic Horizontal Wall Beds
UPDATE public.products
SET
  description_de = 'Ideal für Räume mit niedrigen Decken, Dachböden oder schmale Grundrisse. Klappt entlang der Längsseite herunter, um minimale Deckenhöhe zu beanspruchen – mit flüsterleiser MORPHY™ Gasdruckunterstützung.',
  description_fr = 'Idéal pour les pièces à plafond bas, les combles ou les espaces étroits. Se rabat le long du côté le plus long pour minimiser la hauteur sous plafond requise grâce à l''assistance à gaz silencieuse MORPHY™.',
  description_es = 'Ideal para habitaciones con techos bajos, buhardillas o espacios estrechos. Se abate a lo largo de su lado mayor para requerir menor altura de techo con suave asistencia de gas MORPHY™.',
  description_it = 'Ideale per stanze con soffitti bassi, mansarde o spazi stretti. Si apre lungo il lato lungo per ridurre al minimo l''altezza richiesta, con pistoni a gas MORPHY™ silenziosi.',
  description_por = 'Ideal para divisões com tetos baixos, sótãos ou espaços estreitos. Rebate ao longo do lado mais comprido para minimizar a altura necessária ao teto com assistência a gás suave MORPHY™.',
  description_pt = 'Ideal para divisões com tetos baixos, sótãos ou espaços estreitos. Rebate ao longo do lado mais comprido para minimizar a altura necessária ao teto com assistência a gás suave MORPHY™.'
WHERE parent_category = 'beds' 
  AND orientation = 'Horizontal' 
  AND (type ILIKE '%classic%' OR sub_category ILIKE '%classic%')
  AND (description_de IS NULL OR description_de = description);

-- Studio Wall Beds
UPDATE public.products
SET
  description_de = 'Ausgestattet mit dekorativer Frontplatte, moderner Ästhetik und sanfter Gasdruck-Hebeunterstützung. Perfekt als stilvolles Solitärmöbel mit modernem MORPHY™ Design.',
  description_fr = 'Doté de panneaux décoratifs en façade, d''une esthétique contemporaine et d''un relevage assisté par vérins à gaz. Idéal comme lit escamotable autonome au style MORPHY™ moderne.',
  description_es = 'Con panel frontal decorativo, estética moderna y elevación suave asistida por gas. Perfecto como cama abatible independiente con el estilo moderno de MORPHY™.',
  description_it = 'Dotato di pannello frontale decorativo, estetica contemporanea e sollevamento assistito a gas. Perfetto come letto a scomparsa indipendente con design moderno MORPHY™.',
  description_por = 'Com painel frontal decorativo, estética contemporânea e elevação suave assistida por pistões a gás. Perfeito como cama rebatível independente com design moderno MORPHY™.',
  description_pt = 'Com painel frontal decorativo, estética contemporânea e elevação suave assistida por pistões a gás. Perfeito como cama rebatível independente com design moderno MORPHY™.'
WHERE parent_category = 'beds' 
  AND (type ILIKE '%studio%' OR sub_category ILIKE '%studio%')
  AND (description_de IS NULL OR description_de = description);

-- Integrated Wall Beds
UPDATE public.products
SET
  description_de = 'Speziell entwickelt für den nahtlosen Einbau in maßgefertigte Schränke, Einbauschränke und modulare Aufbewahrungssysteme. Unterstützt vollständige interaktive 3D-Konfiguration.',
  description_fr = 'Spécifiquement conçu pour s''intégrer harmonieusement dans des armoires sur mesure et des systèmes de rangement modulaires. Compatible avec la personnalisation 3D interactive.',
  description_es = 'Diseñado específicamente para integrarse a la perfección en armarios a medida y sistemas modulares de almacenamiento. Compatible con personalización interactiva en 3D.',
  description_it = 'Progettato specificamente per integrarsi armoniosamente in armadi su misura e sistemi di arredo modulari. Supporta la configurazione interattiva 3D completa.',
  description_por = 'Projetado especificamente para se integrar perfeitamente em armários sob medida e sistemas modulares de arrumação. Suporta personalização interativa 3D completa.',
  description_pt = 'Projetado especificamente para se integrar perfeitamente em armários sob medida e sistemas modulares de arrumação. Suporta personalização interativa 3D completa.'
WHERE parent_category = 'beds' 
  AND (type ILIKE '%integrated%' OR sub_category ILIKE '%integrated%')
  AND (description_de IS NULL OR description_de = description);

-- --------------------------------------------------------------------
-- 3. Populate Descriptions for Cabinets
-- --------------------------------------------------------------------
UPDATE public.products
SET
  description_de = 'Unsere Schrankumbauten sind perfekt darauf abgestimmt, die Schrankbetten der Classic-Serie einzufassen. Sie bieten eine elegante, attraktive und ordentliche Möglichkeit, Ihr Schrankbett unsichtbar zu verstauen – und halten Bett, Matratze und Bettwäsche staubfrei und wie neu.',
  description_fr = 'Nos armoires sont parfaitement conçues pour intégrer et habiller les lits escamotables de la gamme Classic. Elles offrent une solution soignée et élégante pour dissimuler votre lit – gardant votre lit, matelas et literie à l''abri de la poussière.',
  description_es = 'Nuestros muebles están perfectamente diseñados para envolver y complementar las camas abatibles de la serie Classic. Ofrecen una forma ordenada y atractiva de ocultar la cama, manteniendo el colchón y la ropa de cama impecables y libres de polvo.',
  description_it = 'I nostri mobili armadio sono perfettamente progettati per contenere e valorizzare i letti a scomparsa della serie Classic. Offrono un modo ordinato ed elegante per riporre il letto, mantenendo materasso e lenzuola sempre puliti e privi di polvere.',
  description_por = 'Os nossos armários foram concebidos com precisão para acolher e complementar as camas rebatíveis da gama Classic. Oferecem uma forma elegante e funcional de guardar a cama, mantendo o colchão e a roupa de cama sem pó e impecáveis.',
  description_pt = 'Os nossos armários foram concebidos com precisão para acolher e complementar as camas rebatíveis da gama Classic. Oferecem uma forma elegante e funcional de guardar a cama, mantendo o colchão e a roupa de cama sem pó e impecáveis.',
  extended_description_en = 'Manufactured from high-grade melamine-faced furniture board. Engineered specifically for our Classic Wall Bed frames with high-precision hinges and flat-packed delivery for convenient room assembly.',
  extended_description_de = 'Hergestellt aus hochwertigen, melaminbeschichteten Möbelbauplatten. Speziell konstruiert für unsere klassischen Schrankbettrahmen, mit Weitwinkelscharnieren für bequemen Zugang.',
  extended_description_fr = 'Fabriquées à partir de panneaux de particules mélaminés de haute qualité. Spécifiquement développées pour nos cadres de lit escamotable Classic avec charnières grand angle pour un accès dégagé.',
  extended_description_es = 'Fabricados con tablero de partículas melaminado de primera calidad. Diseñados específicamente para nuestras camas abatibles Classic con bisagras de amplia apertura.',
  extended_description_it = 'Realizzati con pannelli nobilitati melaminici di alta qualità. Progettati specificamente per i nostri telai Classic con cerniere ad ampia apertura per un facile accesso.',
  extended_description_por = 'Fabricados em painéis de partículas melamínicos de alta qualidade. Concebidos especificamente para as nossas camas rebatíveis Classic com dobradiças de grande amplitude.',
  extended_description_pt = 'Fabricados em painéis de partículas melamínicos de alta qualidade. Concebidos especificamente para as nossas camas rebatíveis Classic com dobradiças de grande amplitude.'
WHERE parent_category = 'cabinets';

-- --------------------------------------------------------------------
-- 4. Populate Descriptions for Mattresses
-- --------------------------------------------------------------------

-- Comfort Mattress
UPDATE public.products
SET
  description_de = 'Unsere WBK Comfort Matratze bietet eine Gesamthöhe von 20 cm mit 50 mm Memory-Schaum und einem hochelastischen Kaltschaumkern. Speziell entwickelt, um sich perfekt in alle WallBedKing Schrankbetten einzufügen.',
  description_fr = 'Notre matelas WBK Comfort propose une épaisseur de 20 cm avec 50 mm de mousse à mémoire de forme et une base reflex haute densité. Conçu pour se replier parfaitement dans tous les lits escamotables WallBedKing.',
  description_es = 'Nuestro colchón WBK Comfort cuenta con 20 cm de grosor con 50 mm de espuma viscoelástica y núcleo de alta densidad. Diseñado para plegarse a la perfección en todas las camas WallBedKing.',
  description_it = 'Il nostro materasso WBK Comfort offre un''altezza di 20 cm con 50 mm di memory foam e base reflex ad alta densità. Progettato per chiudersi perfettamente in tutti i letti a scomparsa WallBedKing.',
  description_por = 'O nosso colchão WBK Comfort tem 20 cm de espessura com 50 mm de espuma viscoelástica e base de alta densidade. Concebido para recolher na perfeição em todas as camas WallBedKing.',
  description_pt = 'O nosso colchão WBK Comfort tem 20 cm de espessura com 50 mm de espuma viscoelástica e base de alta densidade. Concebido para recolher na perfeição em todas as camas WallBedKing.',
  extended_description_en = 'Engineered specifically for wall bed folding mechanics. Features a hypoallergenic zip-cover, optimal weight balance, and 1-year manufacturer warranty with 30-day trial guarantee.',
  extended_description_de = 'Speziell auf Klappmechanismen abgestimmt. Mit hypoallergenem Reißverschlussbezug, optimaler Gewichtsbalance und 1 Jahr Herstellergarantie plus 30-Tage-Zufriedenheitsgarantie.',
  extended_description_fr = 'Spécialement optimisé pour les mécanismes de lits escamotables. Housse hypoallergénique zippée, équilibre de poids parfait et garantie fabricant de 1 an avec essai de 30 jours.',
  extended_description_es = 'Optimizado para mecanismos abatibles. Funda hipoalergénica con cremallera, equilibrio de peso ideal y 1 año de garantía del fabricante con prueba de 30 días.',
  extended_description_it = 'Ottimizzato per meccanismi a ribalta. Fodera anallergica con cerniera, perfetto bilanciamento del peso e 1 anno di garanzia con 30 giorni di prova.',
  extended_description_por = 'Otimizado para mecanismos rebatíveis. Capa hipoalergénica com fecho, equilíbrio de peso ideal e 1 ano de garantia do fabricante com teste de 30 dias.',
  extended_description_pt = 'Otimizado para mecanismos rebatíveis. Capa hipoalergénica com fecho, equilíbrio de peso ideal e 1 ano de garantia do fabricante com teste de 30 dias.'
WHERE parent_category = 'mattresses' AND (name ILIKE '%comfort%' OR slug ILIKE '%comfort%');

-- Luxury Mattress
UPDATE public.products
SET
  description_de = 'Unsere WBK Luxury Matratze kombiniert einen mittelfesten orthopädischen Kaltschaumkern mit einer tieferen 75 mm Memory-Schaum-Komfortschicht für maximale Druckentlastung und erholsamen Schlaf.',
  description_fr = 'Notre matelas WBK Luxury combine une base reflex orthopédique mi-ferme avec une couche généreuse de 75 mm de mousse à mémoire de forme pour un soutien anatomique supérieur.',
  description_es = 'Nuestro colchón WBK Luxury combina un núcleo ortopédico de firmeza media con una capa viscoelástica de 75 mm para un alivio óptimo de la presión y un descanso reparador.',
  description_it = 'Il nostro materasso WBK Luxury combina un supporto ortopedico a media rigidità con uno strato di memory foam da 75 mm per un sollievo profondo dalla pressione corporea.',
  description_por = 'O nosso colchão WBK Luxury combina uma base ortopédica de firmeza média com uma camada viscoelástica de 75 mm para um alívio de pressão anatómico e noites regeneradoras.',
  description_pt = 'O nosso colchão WBK Luxury combina uma base ortopédica de firmeza média com uma camada viscoelástica de 75 mm para um alívio de pressão anatómico e noites regeneradoras.'
WHERE parent_category = 'mattresses' AND (name ILIKE '%luxury%' OR slug ILIKE '%luxury%');

-- Supreme Mattress
UPDATE public.products
SET
  description_de = 'Die WBK Supreme Matratze bietet das ultimative Hybrid-Schlaferlebnis: 1.500 einzeln verpackte Tonnentaschenfedern, kombiniert mit anschmiegsamem Memory-Schaum und Motion Isolation Technology™.',
  description_fr = 'Le matelas WBK Supreme offre une expérience hybride haut de gamme : 1 500 ressorts ensachés individuels associés à une mousse à mémoire de forme et la technologie Motion Isolation™.',
  description_es = 'El colchón WBK Supreme ofrece la máxima experiencia de descanso híbrido: 1.500 muelles ensacados independientes combinados con viscoelástica y tecnología de aislamiento del movimiento.',
  description_it = 'Il materasso WBK Supreme offre la migliore esperienza di riposo ibrida: 1.500 molle insacchettate indipendenti unite a memory foam e tecnologia Motion Isolation™.',
  description_por = 'O colchão WBK Supreme proporciona uma experiência híbrida de alta gama: 1.500 molas ensacadas individuais aliadas a espuma viscoelástica e Motion Isolation Technology™.',
  description_pt = 'O colchão WBK Supreme proporciona uma experiência híbrida de alta gama: 1.500 molas ensacadas individuais aliadas a espuma viscoelástica e Motion Isolation Technology™.'
WHERE parent_category = 'mattresses' AND (name ILIKE '%supreme%' OR slug ILIKE '%supreme%');

-- --------------------------------------------------------------------
-- 5. Populate Descriptions for Sofas
-- --------------------------------------------------------------------
UPDATE public.products
SET
  description_de = 'Speziell entwickelt für die Platzierung vor vertikalen WallBedKing Schrankbetten. Senkt sich mühelos ab, wenn das Bett heruntergeklappt wird, ohne Module abnehmen zu müssen.',
  description_fr = 'Conçu pour être installé directement devant les lits escamotables verticaux WallBedKing. S''abaisse en toute simplicité lorsque le lit est ouvert sans retirer les coussins.',
  description_es = 'Diseñado para colocarse directamente delante de las camas abatibles verticales WallBedKing. Se abate fácilmente con la cama sin necesidad de desmontar módulos.',
  description_it = 'Progettato per essere posizionato direttamente davanti ai letti a scomparsa verticali WallBedKing. Si appiattisce comodamente all''apertura del letto.',
  description_por = 'Projetado para se posicionar à frente das camas rebatíveis verticais WallBedKing. Articula suavemente com a descida da cama sem desmontar os módulos.',
  description_pt = 'Projetado para se posicionar à frente das camas rebatíveis verticais WallBedKing. Articula suavemente com a descida da cama sem desmontar os módulos.'
WHERE parent_category = 'sofas' AND (name ILIKE '%front%' OR slug ILIKE '%front%');
