-- ============================================================

-- SPACE SAVING TABLES IMPORT (STAGING / HIDDEN IN PRODUCTION)

-- Visibility set to 'hidden' so it does not affect live store

-- ============================================================



-- 1. Ensure column sizes can fit extended variant descriptions

ALTER TABLE public.products ALTER COLUMN color TYPE VARCHAR(150);



-- 2. Clean up any existing table items to avoid slug conflicts on re-run

DELETE FROM public.products WHERE parent_category = 'tables' OR (id >= 301 AND id <= 500);



-- 3. Ensure 'tables' category exists in public.categories (hidden until ready for public launch)

INSERT INTO public.categories (
  id, name, title, title_en, slug, href, description, description_en, image, grid_image, display_order, is_visible, is_featured
) VALUES (
  'tables', 'Smart & Transforming Tables', 'Smart Tables', 'Smart Tables', 'tables', '/products/tables',
  'Multifunctional, height-adjustable, drop-leaf and extending tables engineered for compact living and seamless bed pairing.',
  'Multifunctional, height-adjustable, drop-leaf and extending tables engineered for compact living and seamless bed pairing.',
  '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp',
  '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp',
  5, false, false
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  title_en = EXCLUDED.title_en,
  image = EXCLUDED.image,
  grid_image = EXCLUDED.grid_image;



INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  301, 'B2473M-ME018-1+M021', '5061118253806', '5061118253806', 'Transformer Storage Shelf To Dining Table - walnut MDF top +Dark grey frame',
  'transformer-storage-shelf-to-dining-table-b2473m-walnut-mdf-top-dark-grey-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut MDF top +Dark grey frame', 550.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'Unlock the twist handle and simply lower down the shelves, this transformable shelf table changes into a dining table in a moment with nothing move magically. This clever design dose a favor for you to hold an unexpected or an occasional dinner parties easily. This flexible shelf table is a true space saver, it can work as a bookshelf in the study or a cabinet in the sitting room.

### Features
Extendable table size - The convertible shelf changes from a shelf to a dinning table by unlocking the twist handle, which accommodates 8 people easily. Adjustable height - The table can be adjusted from a vertical structure to a flat table simply. High-quality materials - The E0 grade MDF table top is made of nice melamine veneered. The table legs are made of carbon steel. Storage and Space saving - The transforming shelf table is a true space saver as a bookshelf in the study or a cabinet in the sitting room or anywhere.

### Specifications
Assembly - This product needs light assembly. Attach the base to the already assembled table. Cleaning and Care - Use a mild soap and soft cloth to wipe surfaces clean. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Keep minimum one meter away from heating equipment or other heat sources. Keep away from direct sunlight. Finish - Finished in a medium walnut panel and black legs coated with powder.

**Dimensions:** In bookshelf form: 1370mm tall* 301mm deep(shelf), In table form: 765mm tall*800mm wide(tabletop)*1509mm long.

**Material:** Wood, Steel', 'Unlock the twist handle and simply lower down the shelves, this transformable shelf table changes into a dining table in a moment with nothing move magically. This clever design dose a favor for you to hold an unexpected or an occasional dinner parties easily. This flexible shelf table is a true space saver, it can work as a bookshelf in the study or a cabinet in the sitting room.

### Features
Extendable table size - The convertible shelf changes from a shelf to a dinning table by unlocking the twist handle, which accommodates 8 people easily. Adjustable height - The table can be adjusted from a vertical structure to a flat table simply. High-quality materials - The E0 grade MDF table top is made of nice melamine veneered. The table legs are made of carbon steel. Storage and Space saving - The transforming shelf table is a true space saver as a bookshelf in the study or a cabinet in the sitting room or anywhere.

### Specifications
Assembly - This product needs light assembly. Attach the base to the already assembled table. Cleaning and Care - Use a mild soap and soft cloth to wipe surfaces clean. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Keep minimum one meter away from heating equipment or other heat sources. Keep away from direct sunlight. Finish - Finished in a medium walnut panel and black legs coated with powder.

**Dimensions:** In bookshelf form: 1370mm tall* 301mm deep(shelf), In table form: 765mm tall*800mm wide(tabletop)*1509mm long.

**Material:** Wood, Steel', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table29ec6ab4-d2c6-40d4-80ae-95c29973b6b6.webp',
  ARRAY['/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table29ec6ab4-d2c6-40d4-80ae-95c29973b6b6.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table37be8.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablea19d4037-44a8-490d-927f-8b9d34c33571.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tableaad04.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablee477d391-4f57-480d-bd52-10d39d901e6d.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablee4966d0e-a1b7-49a4-af5c-d2b18ab2beba.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablefa96a8e0-1eb7-4fc7-b6ec-b3df3db0ae25.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  302, 'B2473M-W023+M004', '5061118253813', '5061118253813', 'Transformer Storage Shelf To Dining Table - White Glossy MDF top+silvery paint frame',
  'transformer-storage-shelf-to-dining-table-b2473m-white-glossy-mdf-top-silvery-paint-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'White Glossy MDF top+silvery paint frame', 690.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'Unlock the twist handle and simply lower down the shelves, this transformable shelf table changes into a dining table in a moment with nothing move magically. This clever design dose a favor for you to hold an unexpected or an occasional dinner parties easily. This flexible shelf table is a true space saver, it can work as a bookshelf in the study or a cabinet in the sitting room.

### Features
Extendable table size - The convertible shelf changes from a shelf to a dinning table by unlocking the twist handle, which accommodates 8 people easily. Adjustable height - The table can be adjusted from a vertical structure to a flat table simply. High-quality materials - The E0 grade MDF table top is made of nice melamine veneered. The table legs are made of carbon steel. Storage and Space saving - The transforming shelf table is a true space saver as a bookshelf in the study or a cabinet in the sitting room or anywhere.

### Specifications
Assembly - This product needs light assembly. Attach the base to the already assembled table. Cleaning and Care - Use a mild soap and soft cloth to wipe surfaces clean. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Keep minimum one meter away from heating equipment or other heat sources. Keep away from direct sunlight. Finish - Finished in a medium walnut panel and black legs coated with powder.

**Dimensions:** In bookshelf form: 1370mm tall* 301mm deep(shelf), In table form: 765mm tall*800mm wide(tabletop)*1509mm long.

**Material:** Wood, Steel', 'Unlock the twist handle and simply lower down the shelves, this transformable shelf table changes into a dining table in a moment with nothing move magically. This clever design dose a favor for you to hold an unexpected or an occasional dinner parties easily. This flexible shelf table is a true space saver, it can work as a bookshelf in the study or a cabinet in the sitting room.

### Features
Extendable table size - The convertible shelf changes from a shelf to a dinning table by unlocking the twist handle, which accommodates 8 people easily. Adjustable height - The table can be adjusted from a vertical structure to a flat table simply. High-quality materials - The E0 grade MDF table top is made of nice melamine veneered. The table legs are made of carbon steel. Storage and Space saving - The transforming shelf table is a true space saver as a bookshelf in the study or a cabinet in the sitting room or anywhere.

### Specifications
Assembly - This product needs light assembly. Attach the base to the already assembled table. Cleaning and Care - Use a mild soap and soft cloth to wipe surfaces clean. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Keep minimum one meter away from heating equipment or other heat sources. Keep away from direct sunlight. Finish - Finished in a medium walnut panel and black legs coated with powder.

**Dimensions:** In bookshelf form: 1370mm tall* 301mm deep(shelf), In table form: 765mm tall*800mm wide(tabletop)*1509mm long.

**Material:** Wood, Steel', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table29ec6ab4-d2c6-40d4-80ae-95c29973b6b6.webp',
  ARRAY['/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table29ec6ab4-d2c6-40d4-80ae-95c29973b6b6.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table37be8.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablea19d4037-44a8-490d-927f-8b9d34c33571.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tableaad04.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablee477d391-4f57-480d-bd52-10d39d901e6d.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablee4966d0e-a1b7-49a4-af5c-d2b18ab2beba.webp', '/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablefa96a8e0-1eb7-4fc7-b6ec-b3df3db0ae25.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  303, 'B2563-1M-ME0721-+M003-1+M010', '5061118253820', '5061118253820', 'Space Saving Console & Desk Table B2563-1M - Natural wood and black MDF top+BLACK frame',
  'space-saving-console-desk-table-b2563-1m-b2563-1m-natural-wood-and-black-mdf-top-black-frame', 'tables', 'Smart Tables', 'Console & Desk Table', 'Console & Desk Tables',
  'Natural wood and black MDF top+BLACK frame', 500.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  304, 'B2389-8M-ME019-1+M019', '5061118253837', '5061118253837', 'Folding Space Saving Round Table - Natural wood MDF top+khaki frame (B2389-8M)',
  'folding-space-saving-round-table-b2389-8m-natural-wood-mdf-top-khaki-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Natural wood MDF top+khaki frame (B2389-8M)', 280.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', 'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp',
  ARRAY['/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-tabledab77145-3ccb-46b8-b0e1-b848f39d6416.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  305, 'B2389-8M-ME029-1+M021', '5061118253844', '5061118253844', 'Folding Space Saving Round Table - black marble MDF top+dark gray frame (B2389-8M)',
  'folding-space-saving-round-table-b2389-8m-black-marble-mdf-top-dark-gray-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'black marble MDF top+dark gray frame (B2389-8M)', 290.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', 'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp',
  ARRAY['/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-tabledab77145-3ccb-46b8-b0e1-b848f39d6416.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  306, 'B2389M-ME018-1+M021', '5061118253851', '5061118253851', 'Folding Space Saving Round Table - walnut MDF top+dark gray frame (B2389M)',
  'folding-space-saving-round-table-b2389m-walnut-mdf-top-dark-gray-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut MDF top+dark gray frame (B2389M)', 380.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', 'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp',
  ARRAY['/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-tabledab77145-3ccb-46b8-b0e1-b848f39d6416.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  307, 'B2389M-ME005-1+M014', '5061118253868', '5061118253868', 'Folding Space Saving Round Table - white MDF top+white frame (B2389M)',
  'folding-space-saving-round-table-b2389m-white-mdf-top-white-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white MDF top+white frame (B2389M)', 380.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', 'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp',
  ARRAY['/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-tabledab77145-3ccb-46b8-b0e1-b848f39d6416.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  308, 'B2389-9M-ME051-1+M021', '5061118253875', '5061118253875', 'Folding Space Saving Round Table - oak MDF top+dark gray frame (B2389-9M)',
  'folding-space-saving-round-table-b2389-9m-oak-mdf-top-dark-gray-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'oak MDF top+dark gray frame (B2389-9M)', 380.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', 'If you''re someone who values convenience and style, this table is perfect for you. It''s designed to be collapsible, so you can easily pack it away when you''re not using it. This function is especially useful for those who live in small apartments or are always on the move.

### Features
Foldable Function - The Foldable function is perfect for anyone who wants to stay organized and save space at home or on-the-go. It is ideal for those who have limited storage or simply want a more compact solution. Thanks to its unique design, the table can be easily folded up and tucked away when not in use – saving you valuable space and making it easy to take with you wherever you go.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ900mm

**Material:** Wood + metal', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp',
  ARRAY['/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table1c9a8c17-57c1-44a8-bcb5-97ee3f1ebd94.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-table4571213c-3b96-4f21-9c3c-bdb5d5c8a4fe.webp', '/product-images/tables/b2389-8m-folding-space-saving-round-table/folding-space-saving-round-tabledab77145-3ccb-46b8-b0e1-b848f39d6416.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  309, 'B2525-2M-ME057-1', '5061118253882', '5061118253882', 'Expanding Multi-use Convertible Dining Table - light grey MDF top',
  'expanding-multi-use-convertible-dining-table-b2525-2m-light-grey-mdf-top', 'tables', 'Smart Tables', 'Console & Desk Table', 'Console & Desk Tables',
  'light grey MDF top', 580.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table can be used as a storage cabinet when it is not extended, it will not take up too much space, and after it is extended, it can be used as a desk for working or studying and reading, and the operation is relatively simple, holding the handle to pull the table outward to expand the size of the desktop.

### Features
Space saving - The size of the table without extension is 378*550*772mm. Extendable table size - Hold the handle and pull the table out can expand the table size from 378*550mm to 1300*550mm. High quality materials - The table is made of E0 grade MDF with double-side synchronized texture melamine. Convertible - The table can be transformed from a storage cabinet into a desk.

### How It Works
Hold the handle and pull the table out to expand the table top size, turn it from a storage cabinet to a desk.

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth.

**Dimensions:** 378mm*550mm & 1300mm*550mm, extendable

**Material:** Wood + Metal', 'This table can be used as a storage cabinet when it is not extended, it will not take up too much space, and after it is extended, it can be used as a desk for working or studying and reading, and the operation is relatively simple, holding the handle to pull the table outward to expand the size of the desktop.

### Features
Space saving - The size of the table without extension is 378*550*772mm. Extendable table size - Hold the handle and pull the table out can expand the table size from 378*550mm to 1300*550mm. High quality materials - The table is made of E0 grade MDF with double-side synchronized texture melamine. Convertible - The table can be transformed from a storage cabinet into a desk.

### How It Works
Hold the handle and pull the table out to expand the table top size, turn it from a storage cabinet to a desk.

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth.

**Dimensions:** 378mm*550mm & 1300mm*550mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2525-2m-expanding-multi-use-convertible-dining-table/p20240412153124893ab.webp', '/product-images/tables/b2525-2m-expanding-multi-use-convertible-dining-table/p2024041215313038e72.webp',
  ARRAY['/product-images/tables/b2525-2m-expanding-multi-use-convertible-dining-table/p20240412153124893ab.webp', '/product-images/tables/b2525-2m-expanding-multi-use-convertible-dining-table/p2024041215313038e72.webp', '/product-images/tables/b2525-2m-expanding-multi-use-convertible-dining-table/p20240412153135496a0.webp']::TEXT[], '60.5*44.5*83cm, 0.223CBM', '1pc/ctn'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  310, 'B2549-3M-ME005- 1', '5061118253899', '5061118253899', 'Space Saving Dining Table B2549-3M - white MDF top',
  'space-saving-dining-table-b2549-3m-b2549-3m-white-mdf-top', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white MDF top', 1210.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  311, 'C3495M-R025+M021', '5061118253905', '5061118253905', 'Luxury with Backrest Dining Chair - Blue seat+dark gray frame',
  'luxury-with-backrest-dining-chair-c3495m-blue-seat-dark-gray-frame', 'tables', 'Smart Tables', 'Cube Stool', 'Cube Stools',
  'Blue seat+dark gray frame', 820.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This dining chair is a cube shape with 4 chairs hidden inside. When you need it, you can pull out the 4 chairs and open the cushion on top to turn it into a chair with a backrest. The middle one can be used as a stool or a small table, put some cups, fruits and books on it, it is very suitable for a group of friends to get together to chat and celebrate. There are pulleys underneath the stool, which is more convenient to move.

### Features
Convertible and space saving - 5 seats hidden in the ottoman stool help space saving. High-quality materials - Strong nested metal bases support stands.The padded tops keep comfortable for sitting in a long time.

### How It Works
The cube stores 5 seats in it. Pull the chairs around the cube chair back out. Open the top cushion into a chair with a backrest.

### Specifications
No assembly required - The dining chair can be used upon receipt and does not need to be assembled. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 565mm*565mm

**Material:** Metal + leather', 'This dining chair is a cube shape with 4 chairs hidden inside. When you need it, you can pull out the 4 chairs and open the cushion on top to turn it into a chair with a backrest. The middle one can be used as a stool or a small table, put some cups, fruits and books on it, it is very suitable for a group of friends to get together to chat and celebrate. There are pulleys underneath the stool, which is more convenient to move.

### Features
Convertible and space saving - 5 seats hidden in the ottoman stool help space saving. High-quality materials - Strong nested metal bases support stands.The padded tops keep comfortable for sitting in a long time.

### How It Works
The cube stores 5 seats in it. Pull the chairs around the cube chair back out. Open the top cushion into a chair with a backrest.

### Specifications
No assembly required - The dining chair can be used upon receipt and does not need to be assembled. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 565mm*565mm

**Material:** Metal + leather', '/product-images/tables/c3495m-luxury-with-backrest-dining-chair/luxury-with-backrest-dining-chair08ba2.webp', '/product-images/tables/c3495m-luxury-with-backrest-dining-chair/luxury-with-backrest-dining-chairf56dd.webp',
  ARRAY['/product-images/tables/c3495m-luxury-with-backrest-dining-chair/luxury-with-backrest-dining-chair08ba2.webp', '/product-images/tables/c3495m-luxury-with-backrest-dining-chair/luxury-with-backrest-dining-chairf56dd.webp']::TEXT[], '62.5*62.5*55.5cm, 0.217CBM', '1pc/ctn'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  312, 'C3487-3M-R017+M004', '5061118253912', '5061118253912', 'Multi-function 5 in 1 Removable Stool - Black seat+silver frame',
  'multi-function-5-in-1-removable-stool-c3487-3m-black-seat-silver-frame', 'tables', 'Smart Tables', 'Cube Stool', 'Cube Stools',
  'Black seat+silver frame', 480.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you are someone who values both fashion and practicality, then our stool is the perfect product for you. Our stool is not just a piece of furniture, but also a true statement of style. With sleek lines and a minimalist design, it will complement any contemporary home decor. You''ll appreciate the attention to detail and quality materials that go into every piece, making it both durable and comfortable.

### Features
5 in 1 - The design of this stool is very unique and interesting. From the outside, it is just a beautiful stool, but when you open the cover of the stool, you will find that there are four stools of different sizes hidden inside, and you can get a total of five stools. Storage - Because of the unique and interesting design, when you take out all the stools inside the largest stool, the largest stool is not filled with things, but similar to an empty box. At this time, you can store things in it, and use it as a stool but also as a small locker, to make a contribution to your household cleaning work.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame are powder coated steel or chrome legs.

**Dimensions:** 590mm*590mm

**Material:** PU/ Fabric', 'If you are someone who values both fashion and practicality, then our stool is the perfect product for you. Our stool is not just a piece of furniture, but also a true statement of style. With sleek lines and a minimalist design, it will complement any contemporary home decor. You''ll appreciate the attention to detail and quality materials that go into every piece, making it both durable and comfortable.

### Features
5 in 1 - The design of this stool is very unique and interesting. From the outside, it is just a beautiful stool, but when you open the cover of the stool, you will find that there are four stools of different sizes hidden inside, and you can get a total of five stools. Storage - Because of the unique and interesting design, when you take out all the stools inside the largest stool, the largest stool is not filled with things, but similar to an empty box. At this time, you can store things in it, and use it as a stool but also as a small locker, to make a contribution to your household cleaning work.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame are powder coated steel or chrome legs.

**Dimensions:** 590mm*590mm

**Material:** PU/ Fabric', '/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stool0f50c.webp', '/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stool84b94.webp',
  ARRAY['/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stool0f50c.webp', '/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stool84b94.webp', '/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stool8c677.webp', '/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stoola5b71.webp', '/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stoolfd5b4.webp', '/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stoolfe101.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  313, 'C3488-2M-ME005-1+R005', '5061118253929', '5061118253929', 'Smart 7 in 1 Extendable Wooden Stool - White MDF top+white seat (C3488-2M)',
  'smart-7-in-1-extendable-wooden-stool-c3488-2m-white-mdf-top-white-seat', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'White MDF top+white seat (C3488-2M)', 680.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This innovative furniture can be easily expanded to accommodate multiple people, making it perfect for gatherings, parties and events. It is not only practical, but also fashionable! The stylish design will blend seamlessly with any decor, and the durable materials ensure it can stand up to regular use.

### Features
Smart Extendable - This stool has a kind of magic, stretching ability. With just a few simple moves, you can transform this stool from a compact single-seat stool into a spacious bench that can comfortably seat several people. It''s like putting multiple pieces of furniture together! Removable Cushion - What really sets our stool apart is its cushion. Unlike many other stools on the market, our stool''s seat cushion is not pre-installed. This means you have complete control over how soft, firm or supportive your stool is. Just choose the cushion that best suits your needs and preferences, and voila! You have a stool made just for you.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame is wood.

**Dimensions:** 720mm-3420mm*360mm

**Material:** Wooden,PVC', 'This innovative furniture can be easily expanded to accommodate multiple people, making it perfect for gatherings, parties and events. It is not only practical, but also fashionable! The stylish design will blend seamlessly with any decor, and the durable materials ensure it can stand up to regular use.

### Features
Smart Extendable - This stool has a kind of magic, stretching ability. With just a few simple moves, you can transform this stool from a compact single-seat stool into a spacious bench that can comfortably seat several people. It''s like putting multiple pieces of furniture together! Removable Cushion - What really sets our stool apart is its cushion. Unlike many other stools on the market, our stool''s seat cushion is not pre-installed. This means you have complete control over how soft, firm or supportive your stool is. Just choose the cushion that best suits your needs and preferences, and voila! You have a stool made just for you.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame is wood.

**Dimensions:** 720mm-3420mm*360mm

**Material:** Wooden,PVC', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool30317.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool9a4aa.webp',
  ARRAY['/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool30317.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool9a4aa.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stoolf8b93.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  314, 'C3488- 2AM-SM009', '5061118253936', '5061118253936', 'Smart 7 in 1 Extendable Wooden Stool - White Solid wood board top (C3488- 2AM)',
  'smart-7-in-1-extendable-wooden-stool-c3488-2am-white-solid-wood-board-top', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'White Solid wood board top (C3488- 2AM)', 770.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This innovative furniture can be easily expanded to accommodate multiple people, making it perfect for gatherings, parties and events. It is not only practical, but also fashionable! The stylish design will blend seamlessly with any decor, and the durable materials ensure it can stand up to regular use.

### Features
Smart Extendable - This stool has a kind of magic, stretching ability. With just a few simple moves, you can transform this stool from a compact single-seat stool into a spacious bench that can comfortably seat several people. It''s like putting multiple pieces of furniture together! Removable Cushion - What really sets our stool apart is its cushion. Unlike many other stools on the market, our stool''s seat cushion is not pre-installed. This means you have complete control over how soft, firm or supportive your stool is. Just choose the cushion that best suits your needs and preferences, and voila! You have a stool made just for you.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame is wood.

**Dimensions:** 720mm-3420mm*360mm

**Material:** Wooden,PVC', 'This innovative furniture can be easily expanded to accommodate multiple people, making it perfect for gatherings, parties and events. It is not only practical, but also fashionable! The stylish design will blend seamlessly with any decor, and the durable materials ensure it can stand up to regular use.

### Features
Smart Extendable - This stool has a kind of magic, stretching ability. With just a few simple moves, you can transform this stool from a compact single-seat stool into a spacious bench that can comfortably seat several people. It''s like putting multiple pieces of furniture together! Removable Cushion - What really sets our stool apart is its cushion. Unlike many other stools on the market, our stool''s seat cushion is not pre-installed. This means you have complete control over how soft, firm or supportive your stool is. Just choose the cushion that best suits your needs and preferences, and voila! You have a stool made just for you.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame is wood.

**Dimensions:** 720mm-3420mm*360mm

**Material:** Wooden,PVC', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool30317.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool9a4aa.webp',
  ARRAY['/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool30317.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool9a4aa.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stoolf8b93.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  315, 'C3488-4M-R005 white PU', '5061118253943', '5061118253943', 'Smart 7 in 1 Extendable Wooden Stool - MDF in W023 white glossy painting+ seat in (C3488-',
  'smart-7-in-1-extendable-wooden-stool-c3488-4m-mdf-in-w023-white-glossy-painting-seat-in', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'MDF in W023 white glossy painting+ seat in (C3488-', 670.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This innovative furniture can be easily expanded to accommodate multiple people, making it perfect for gatherings, parties and events. It is not only practical, but also fashionable! The stylish design will blend seamlessly with any decor, and the durable materials ensure it can stand up to regular use.

### Features
Smart Extendable - This stool has a kind of magic, stretching ability. With just a few simple moves, you can transform this stool from a compact single-seat stool into a spacious bench that can comfortably seat several people. It''s like putting multiple pieces of furniture together! Removable Cushion - What really sets our stool apart is its cushion. Unlike many other stools on the market, our stool''s seat cushion is not pre-installed. This means you have complete control over how soft, firm or supportive your stool is. Just choose the cushion that best suits your needs and preferences, and voila! You have a stool made just for you.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame is wood.

**Dimensions:** 720mm-3420mm*360mm

**Material:** Wooden,PVC', 'This innovative furniture can be easily expanded to accommodate multiple people, making it perfect for gatherings, parties and events. It is not only practical, but also fashionable! The stylish design will blend seamlessly with any decor, and the durable materials ensure it can stand up to regular use.

### Features
Smart Extendable - This stool has a kind of magic, stretching ability. With just a few simple moves, you can transform this stool from a compact single-seat stool into a spacious bench that can comfortably seat several people. It''s like putting multiple pieces of furniture together! Removable Cushion - What really sets our stool apart is its cushion. Unlike many other stools on the market, our stool''s seat cushion is not pre-installed. This means you have complete control over how soft, firm or supportive your stool is. Just choose the cushion that best suits your needs and preferences, and voila! You have a stool made just for you.

### Specifications
No Assembly - The stool can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - The material is PU or fabric. Frame is wood.

**Dimensions:** 720mm-3420mm*360mm

**Material:** Wooden,PVC', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool30317.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool9a4aa.webp',
  ARRAY['/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool30317.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stool9a4aa.webp', '/product-images/tables/c3488-2m-smart-7-in-1-extendable-wooden-stool/smart-7-in-1-extendable-wooden-stoolf8b93.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  316, 'B2538M-SM007+Q017-1+M023-1', '5061118253950', '5061118253950', 'Space Saving Dining Table B2538M - light oak solid wood board top/leg+beige frame',
  'space-saving-dining-table-b2538m-b2538m-light-oak-solid-wood-board-top-leg-beige-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'light oak solid wood board top/leg+beige frame', 2540.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  317, 'B2538M-SM009+W012+M014', '5061118253967', '5061118253967', 'Space Saving Dining Table B2538M - white solid wood board top/leg+white frame',
  'space-saving-dining-table-b2538m-b2538m-white-solid-wood-board-top-leg-white-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white solid wood board top/leg+white frame', 2540.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  318, 'B2538M-SM005+Q018-1+M010', '5061118253974', '5061118253974', 'Space Saving Dining Table B2538M - walnutsolid wood board top/leg+balck frame',
  'space-saving-dining-table-b2538m-b2538m-walnutsolid-wood-board-top-leg-balck-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnutsolid wood board top/leg+balck frame', 2540.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  319, 'B2241-4M-ME029-1+M021', '5061118253981', '5061118253981', 'Classical Wooden Extendable Console Table - DARK GREY MDF top/leg+Dark grey frame (B2241-4M)',
  'classical-wooden-extendable-console-table-b2241-4m-dark-grey-mdf-top-leg-dark-grey-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'DARK GREY MDF top/leg+Dark grey frame (B2241-4M)', 860.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', 'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp',
  ARRAY['/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p202407011604313e9d5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160440125c5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160617e9f3f.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160641b18a4.webp']::TEXT[], 'Frame:85.5*66*9cm, 0.051CBM Panel:102.5*62.5*23cm, 0.147CBM', '2ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  320, 'B2241-4M-W023+M014', '5061118253998', '5061118253998', 'Classical Wooden Extendable Console Table - white glossy top/leg+white frame (B2241-4M)',
  'classical-wooden-extendable-console-table-b2241-4m-white-glossy-top-leg-white-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white glossy top/leg+white frame (B2241-4M)', 1090.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', 'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp',
  ARRAY['/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p202407011604313e9d5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160440125c5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160617e9f3f.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160641b18a4.webp']::TEXT[], 'Frame:85.5*66*9cm, 0.051CBM Panel:102.5*62.5*23cm, 0.147CBM', '2ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  321, 'B2495M-W023+M004', '5061118254001', '5061118254001', 'Classical Wooden Extendable Console Table - white glossy top+silvery leg (B2495M)',
  'classical-wooden-extendable-console-table-b2495m-white-glossy-top-silvery-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white glossy top+silvery leg (B2495M)', 500.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', 'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp',
  ARRAY['/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p202407011604313e9d5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160440125c5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160617e9f3f.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160641b18a4.webp']::TEXT[], 'Frame:85.5*66*9cm, 0.051CBM Panel:102.5*62.5*23cm, 0.147CBM', '2ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  322, 'B2495M-ME018-1+M021', '5061118254018', '5061118254018', 'Classical Wooden Extendable Console Table - walnut top+dark gray leg (B2495M)',
  'classical-wooden-extendable-console-table-b2495m-walnut-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut top+dark gray leg (B2495M)', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', 'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp',
  ARRAY['/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p202407011604313e9d5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160440125c5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160617e9f3f.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160641b18a4.webp']::TEXT[], 'Frame:85.5*66*9cm, 0.051CBM Panel:102.5*62.5*23cm, 0.147CBM', '2ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  323, 'B2495M-ME013-1+M021', '5061118254025', '5061118254025', 'Classical Wooden Extendable Console Table - drak walnut top+dark gray leg (B2495M)',
  'classical-wooden-extendable-console-table-b2495m-drak-walnut-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'drak walnut top+dark gray leg (B2495M)', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', 'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp',
  ARRAY['/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p202407011604313e9d5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160440125c5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160617e9f3f.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160641b18a4.webp']::TEXT[], 'Frame:85.5*66*9cm, 0.051CBM Panel:102.5*62.5*23cm, 0.147CBM', '2ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  324, 'B2495M-ME028-1+M021', '5061118254032', '5061118254032', 'Classical Wooden Extendable Console Table - Black barble top+dark gray leg (B2495M)',
  'classical-wooden-extendable-console-table-b2495m-black-barble-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Black barble top+dark gray leg (B2495M)', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', 'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp',
  ARRAY['/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p202407011604313e9d5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160440125c5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160617e9f3f.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160641b18a4.webp']::TEXT[], 'Frame:85.5*66*9cm, 0.051CBM Panel:102.5*62.5*23cm, 0.147CBM', '2ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  325, 'B2495M-ME007+M021', '5061118254049', '5061118254049', 'Classical Wooden Extendable Console Table - GREY top+dark gray leg (B2495M)',
  'classical-wooden-extendable-console-table-b2495m-grey-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'GREY top+dark gray leg (B2495M)', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', 'This table size can reach 900*1500mm when extendable, and it can accommodate seating for 6 people, which is perfect when there are guests coming. There are two panels to vary the table size according to different needs. This table doesn''t take up much space when it''s not extended. If you''re looking for a table that extends, this one is a great choice!

### Features
An extendable dining table is a type of dining table that can be resized as needed. It usually consists of a fixed table top and one or more retractable extension panels. The extension panels can be easily added or removed, thus allowing the table to be sized to accommodate different dining needs. Some extendable dining tables are also equipped with storage space that allows for easy storage of utensils and dining room supplies.

### Specifications
Spring lifting system - The table uses a spring lift system. After adjusting the table height, secure the handle to prevent the table from bouncing or lowering. Care & Cleaning - Use a soft cloth and mild soap or water to clean. Do not use harsh cleaning products or chemicals. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 500mm*900mm & 900mm*1500mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp',
  ARRAY['/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p2024070115563129216.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p202407011604313e9d5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160440125c5.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160617e9f3f.webp', '/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/p20240701160641b18a4.webp']::TEXT[], 'Frame:85.5*66*9cm, 0.051CBM Panel:102.5*62.5*23cm, 0.147CBM', '2ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  326, 'B2242-2R-W023+M014', '5061118254056', '5061118254056', 'Modern Classic Spring Folding Dining Table - Table white glossy top+white leg',
  'modern-classic-spring-folding-dining-table-b2242-2r-table-white-glossy-top-white-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Table white glossy top+white leg', 430.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'For the table, do you have the following troubles? Would you like a special table? Do you want a table that can be used in a small size? Do you want a large dining table that can be used in a small space? Do you want a stable, heat-resistant table?

### Features
Foldable Top - The top of the table is folded. When it is folded, it can be used in a small size. When you open the folded table top, you can get a table that is twice the size of the original table. Variable Height - The height of the table is not fixed, it is decided by you. You can adjust the height according to your demands. The adjustable range is 180mm-770mm, as far as possible to meet your demands.

**Dimensions:** 1000mm*450mm-900mm

**Material:** E0 grade MDF, Carbon steel', 'For the table, do you have the following troubles? Would you like a special table? Do you want a table that can be used in a small size? Do you want a large dining table that can be used in a small space? Do you want a stable, heat-resistant table?

### Features
Foldable Top - The top of the table is folded. When it is folded, it can be used in a small size. When you open the folded table top, you can get a table that is twice the size of the original table. Variable Height - The height of the table is not fixed, it is decided by you. You can adjust the height according to your demands. The adjustable range is 180mm-770mm, as far as possible to meet your demands.

**Dimensions:** 1000mm*450mm-900mm

**Material:** E0 grade MDF, Carbon steel', '/product-images/tables/b2242-2r-modern-classic-spring-folding-dining-table/modern-classic-spring-folding-dining-table08afe423-3257-4014-87d0-db0d4082baed.webp', '/product-images/tables/b2242-2r-modern-classic-spring-folding-dining-table/modern-classic-spring-folding-dining-table2638f4f3-f881-49b5-b00d-2c2cee1428d5.webp',
  ARRAY['/product-images/tables/b2242-2r-modern-classic-spring-folding-dining-table/modern-classic-spring-folding-dining-table08afe423-3257-4014-87d0-db0d4082baed.webp', '/product-images/tables/b2242-2r-modern-classic-spring-folding-dining-table/modern-classic-spring-folding-dining-table2638f4f3-f881-49b5-b00d-2c2cee1428d5.webp', '/product-images/tables/b2242-2r-modern-classic-spring-folding-dining-table/modern-classic-spring-folding-dining-table647076fe-5161-4412-8722-656cd4b52ff1.webp', '/product-images/tables/b2242-2r-modern-classic-spring-folding-dining-table/modern-classic-spring-folding-dining-table7ab1a40e-3247-4ff1-a05e-0eccf94ba4f9.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  327, 'B2219-S-1M-ME005-1+M004', '5061118254063', '5061118254063', 'Space Saving Dining Table B2219-S-1M - white top+Silver leg',
  'space-saving-dining-table-b2219-s-1m-b2219-s-1m-white-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white top+Silver leg', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  328, 'B2219-S-1M-M004+ME012-1', '5061118254070', '5061118254070', 'Space Saving Dining Table B2219-S-1M - Gray top+Silver leg',
  'space-saving-dining-table-b2219-s-1m-b2219-s-1m-gray-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Gray top+Silver leg', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  329, 'B2219-S-1M-M021+ME013-1', '5061118254087', '5061118254087', 'Space Saving Dining Table B2219-S-1M - walnut top+dark gray leg',
  'space-saving-dining-table-b2219-s-1m-b2219-s-1m-walnut-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut top+dark gray leg', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  330, 'B2219-S-1M-M021+ME032-1', '5061118254094', '5061118254094', 'Space Saving Dining Table B2219-S-1M - Natural wood top+dark gray leg',
  'space-saving-dining-table-b2219-s-1m-b2219-s-1m-natural-wood-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Natural wood top+dark gray leg', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  331, 'B2219-S-1M-M004+ME044-1', '5061118254100', '5061118254100', 'Space Saving Dining Table B2219-S-1M - walnut top+Silver leg',
  'space-saving-dining-table-b2219-s-1m-b2219-s-1m-walnut-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut top+Silver leg', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  332, 'B2448-1WM-W023+M004', '5061118254117', '5061118254117', 'Modern Design Lifting Dining Table - WHITE GLOSSY+SILVERY PAINT leg (B2448-1WM)',
  'modern-design-lifting-dining-table-b2448-1wm-white-glossy-silvery-paint-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'WHITE GLOSSY+SILVERY PAINT leg (B2448-1WM)', 720.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', 'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp',
  ARRAY['/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tableed03184c-54ad-47d9-89b0-05cf7378785f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  333, 'B2448M-ME028-1+M021', '5061118254124', '5061118254124', 'Modern Design Lifting Dining Table - Black barble top+dark gray leg (B2448M)',
  'modern-design-lifting-dining-table-b2448m-black-barble-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Black barble top+dark gray leg (B2448M)', 530.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', 'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp',
  ARRAY['/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tableed03184c-54ad-47d9-89b0-05cf7378785f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  334, 'B2448RM-ME028-1+M021', '5061118254131', '5061118254131', 'Modern Design Lifting Dining Table - Black barble top+dark gray leg (B2448RM)',
  'modern-design-lifting-dining-table-b2448rm-black-barble-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Black barble top+dark gray leg (B2448RM)', 530.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', 'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp',
  ARRAY['/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tableed03184c-54ad-47d9-89b0-05cf7378785f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  335, 'B2448RM-M021+ME013-1', '5061118254148', '5061118254148', 'Modern Design Lifting Dining Table - walnut top+dark gray leg (B2448RM)',
  'modern-design-lifting-dining-table-b2448rm-walnut-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut top+dark gray leg (B2448RM)', 530.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', 'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp',
  ARRAY['/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tableed03184c-54ad-47d9-89b0-05cf7378785f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  336, 'B2448RM-M021+ME018-1', '5061118254155', '5061118254155', 'Modern Design Lifting Dining Table - walnut top+dark gray leg (B2448RM)',
  'modern-design-lifting-dining-table-b2448rm-walnut-top-dark-gray-leg-m021-me018-1', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut top+dark gray leg (B2448RM)', 530.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', 'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp',
  ARRAY['/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tableed03184c-54ad-47d9-89b0-05cf7378785f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  337, 'B2448RM-M021+ME019-1', '5061118254162', '5061118254162', 'Modern Design Lifting Dining Table - Natural wood top+dark gray leg (B2448RM)',
  'modern-design-lifting-dining-table-b2448rm-natural-wood-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Natural wood top+dark gray leg (B2448RM)', 530.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', 'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp',
  ARRAY['/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tableed03184c-54ad-47d9-89b0-05cf7378785f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  338, 'B2448RM-M025+ME033-1', '5061118254179', '5061118254179', 'Modern Design Lifting Dining Table - White top+Black leg (B2448RM)',
  'modern-design-lifting-dining-table-b2448rm-white-top-black-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'White top+Black leg (B2448RM)', 530.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', 'When it comes to furniture, few items are as important as a dining table. This is a place where family and friends come together to break bread, to talk, and to relax. A good dining table should be sturdy, attractive, and able to accommodate a range of different needs. With that in mind, there is one table that stands out from the rest: the Modern Design Lifting Dining Table.

### Features
Convertible Top - This table is equipped with convertible top. This unique piece of furniture is designed to transform any ordinary table into a versatile multi-functional space that can be used for a variety of purpose. The table can be easily transformed from a regular dining table into a work desk, entertainment center, or even a game table.

Adjustable Height Setting - The table has a lifting device that can adjust the height at any time according to your needs. The table can be lowered to 40cm, when the home visitors, it is an important furniture for you to welcome guests, put snacks, tea, fruit. It can be raised from the height of the coffee table to 77.5cm, and can be used as a table after rising to meet the dining needs of a family of four or friends and relatives.

### Specifications
No Assembly - The table can be used after unpacked. Care & Cleaning - To clean the table, simply use a damp cloth and non-abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** 1100mm*600mm-1200mm

**Material:** E0 grade MDF + metal', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp',
  ARRAY['/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-table9139d869-b645-4fef-bb5b-42f21aaf6d80.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tabledfd4ab64-f2f6-4d6b-b28b-4338d626c547.webp', '/product-images/tables/b2448-1wm-modern-design-lifting-dining-table/modern-design-lifting-dining-tableed03184c-54ad-47d9-89b0-05cf7378785f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  339, 'B2476-1M-W023+M004', '5061118254186', '5061118254186', 'Adjustable Coffee To Dining Table - White Glossy MDF top+silver leg',
  'adjustable-coffee-to-dining-table-b2476-1m-white-glossy-mdf-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'White Glossy MDF top+silver leg', 800.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'It is an "oak deformation lifting table" - the frame color is sandblasted gray, beautiful appearance. The oak-colored version of the Adjustable Coffee to Dining table is a space-saving foldable lifting table that can accommodate up to 10 people. The product is designed for use in both modern environments and classical styles. standard in the industry.

### Features
Convertible - This table can be used as a coffee table to enjoy tea time. It can also be converted into a dining table for a family meal in the cosy light. Height adjustable - Our tables are distinctive in many ways and are the quality. A special feature of the table is that it can be adjusted in millimeters. Many workstations on the market can only make some standard adjustments. And our workbench can be adjusted to your liking in millimeters

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 680mm*1000mm&2000mm*400mm&775mm

**Material:** carbon steel, MDF with melamine overlay', 'It is an "oak deformation lifting table" - the frame color is sandblasted gray, beautiful appearance. The oak-colored version of the Adjustable Coffee to Dining table is a space-saving foldable lifting table that can accommodate up to 10 people. The product is designed for use in both modern environments and classical styles. standard in the industry.

### Features
Convertible - This table can be used as a coffee table to enjoy tea time. It can also be converted into a dining table for a family meal in the cosy light. Height adjustable - Our tables are distinctive in many ways and are the quality. A special feature of the table is that it can be adjusted in millimeters. Many workstations on the market can only make some standard adjustments. And our workbench can be adjusted to your liking in millimeters

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 680mm*1000mm&2000mm*400mm&775mm

**Material:** carbon steel, MDF with melamine overlay', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524924388.webp', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524988cd1.webp',
  ARRAY['/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524924388.webp', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524988cd1.webp', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-tableb0f26.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  340, 'B2476-1M-ME018-1+M010', '5061118254193', '5061118254193', 'Adjustable Coffee To Dining Table - Walnut MDF top+black leg',
  'adjustable-coffee-to-dining-table-b2476-1m-walnut-mdf-top-black-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Walnut MDF top+black leg', 640.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'It is an "oak deformation lifting table" - the frame color is sandblasted gray, beautiful appearance. The oak-colored version of the Adjustable Coffee to Dining table is a space-saving foldable lifting table that can accommodate up to 10 people. The product is designed for use in both modern environments and classical styles. standard in the industry.

### Features
Convertible - This table can be used as a coffee table to enjoy tea time. It can also be converted into a dining table for a family meal in the cosy light. Height adjustable - Our tables are distinctive in many ways and are the quality. A special feature of the table is that it can be adjusted in millimeters. Many workstations on the market can only make some standard adjustments. And our workbench can be adjusted to your liking in millimeters

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 680mm*1000mm&2000mm*400mm&775mm

**Material:** carbon steel, MDF with melamine overlay', 'It is an "oak deformation lifting table" - the frame color is sandblasted gray, beautiful appearance. The oak-colored version of the Adjustable Coffee to Dining table is a space-saving foldable lifting table that can accommodate up to 10 people. The product is designed for use in both modern environments and classical styles. standard in the industry.

### Features
Convertible - This table can be used as a coffee table to enjoy tea time. It can also be converted into a dining table for a family meal in the cosy light. Height adjustable - Our tables are distinctive in many ways and are the quality. A special feature of the table is that it can be adjusted in millimeters. Many workstations on the market can only make some standard adjustments. And our workbench can be adjusted to your liking in millimeters

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 680mm*1000mm&2000mm*400mm&775mm

**Material:** carbon steel, MDF with melamine overlay', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524924388.webp', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524988cd1.webp',
  ARRAY['/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524924388.webp', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-table2024013005524988cd1.webp', '/product-images/tables/b2476-1m-adjustable-coffee-to-dining-table/adjustable-coffee-to-dining-tableb0f26.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  341, 'B2569M-ceramic-birch-s', '5061118254209', '5061118254209', 'Space Saving Dining Table B2569M - Ceramic +Birch solid wood board top+ Plywood leg',
  'space-saving-dining-table-b2569m-b2569m-ceramic-birch-solid-wood-board-top-plywood-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Ceramic +Birch solid wood board top+ Plywood leg', 4360.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  342, 'B2531-1M-birch-solid-woo', '5061118254216', '5061118254216', 'Space Saving Dining Table B2531-1M - Birch solid wood board top+ Plywood leg',
  'space-saving-dining-table-b2531-1m-b2531-1m-birch-solid-wood-board-top-plywood-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Birch solid wood board top+ Plywood leg', 3940.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  343, 'B2477M-ME018-1+M021', '5061118254223', '5061118254223', 'Transforming Coffee Bed Table - Walnut MDF top+dark gray leg',
  'transforming-coffee-bed-table-b2477m-walnut-mdf-top-dark-gray-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Walnut MDF top+dark gray leg', 1340.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This transformable coffee table can be easily changed to a dining table by the height adjusting system.Miraculously,it can be changed to a comfortable bed by simple operation as well.As a multi-functional and multi-scene using table,it fits more and more modern home.

### Features
Convertible - This table can be transformed from a coffee table to a dining table,a sofa and even a bed. Height adjustable - The height can be adjusted arbitrarily in 325mm to 765mm by hydraulic gas lift system. Height quality material - The tabletop is made of E0 grade MDF with nice melamine veneered,which is wear resistant,stain resistant,durable and environmental friendly. The frame is made of carbon steel in dark gray powder coated. The cushion is upholstered in nice fabric with high density sponge. Space saving and Multi-scene using - This table fits dining room,living room,study room and even bedroom well.It performs excellent as well in tiny space likes modular house,apartment etc..

### How It Works
Raise up or lower down the coffee table by using the gas lift handle. Set in at any level by releasing the gas lift handle. Unfolding the metal legs at the four corners and set the table at the lowest lever. Unfolding the tabletop and expands the bed. Put cushions on.

### Specifications
Assembly required - Take out the table from package to use directly. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals.

**Dimensions:** As a table:1060mm*850mm*325-765mm,height adjustable; As a bed:2080mm*850mm*420mm(bed height)

**Material:** Material of Table-top - E0 standard MDF, Surface Finish - Fine Melamine Veneered, Frame - Carbon Steel+ Powder Coated, Cushion - High Density Foam + Fabric', 'This transformable coffee table can be easily changed to a dining table by the height adjusting system.Miraculously,it can be changed to a comfortable bed by simple operation as well.As a multi-functional and multi-scene using table,it fits more and more modern home.

### Features
Convertible - This table can be transformed from a coffee table to a dining table,a sofa and even a bed. Height adjustable - The height can be adjusted arbitrarily in 325mm to 765mm by hydraulic gas lift system. Height quality material - The tabletop is made of E0 grade MDF with nice melamine veneered,which is wear resistant,stain resistant,durable and environmental friendly. The frame is made of carbon steel in dark gray powder coated. The cushion is upholstered in nice fabric with high density sponge. Space saving and Multi-scene using - This table fits dining room,living room,study room and even bedroom well.It performs excellent as well in tiny space likes modular house,apartment etc..

### How It Works
Raise up or lower down the coffee table by using the gas lift handle. Set in at any level by releasing the gas lift handle. Unfolding the metal legs at the four corners and set the table at the lowest lever. Unfolding the tabletop and expands the bed. Put cushions on.

### Specifications
Assembly required - Take out the table from package to use directly. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals.

**Dimensions:** As a table:1060mm*850mm*325-765mm,height adjustable; As a bed:2080mm*850mm*420mm(bed height)

**Material:** Material of Table-top - E0 standard MDF, Surface Finish - Fine Melamine Veneered, Frame - Carbon Steel+ Powder Coated, Cushion - High Density Foam + Fabric', '/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-table2670c.webp', '/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-table3a77b.webp',
  ARRAY['/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-table2670c.webp', '/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-table3a77b.webp', '/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-table4877b8bd-2c2d-4c89-837c-6f4e236d4ad4.webp', '/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-tablece558391-7a9a-49e5-b3d9-034d629568ea.webp', '/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-tableee960eba-859c-4c42-935a-a3b4f5805132.webp', '/product-images/tables/b2477m-transforming-coffee-bed-table/transforming-coffee-bed-tablef16b14d4-4788-46f8-87b1-1f98f399a435.webp']::TEXT[], '', '1pc/ Carton'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  344, 'A1492M-ME019-1+M010', '5061118254230', '5061118254230', 'Minimalist Lifting Coffee Table - Natural MDF top+black frame',
  'minimalist-lifting-coffee-table-a1492m-natural-mdf-top-black-frame', 'tables', 'Smart Tables', 'Coffee & Lifting Table', 'Coffee & Lifting Tables',
  'Natural MDF top+black frame', 670.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'The minimalist coffee table in a simple design comes with wooden tabletop and glass legs. Lifts up the table to lap height at 650mm, an ideal and comfortable height for working, playing or sharing a meal.A high-capacity space hidden under the wooden tabletop can be used to store books,game playthings,snacks,remotes, or even your laptop computer.

### Features
Adjustable height - The coffee table at 330mm height lifts up to lap height at 650mm, an ideal and comfortable height for people to have more possibly working, playing or sharing a meal. Large storage - The high-capacity space hidden under the wooden tabletop offers a large storage to store away items like books,game playthings,snacks,remotes, or even your laptop computer. High quality materials - Table top made of E0 grade MDF.Metal frame made of carbon steel in power coating.Table legs made of glass. Simple design - With smooth tabletop and simple line glass legs,this minimalist coffee table fits more modern home.

### How It Works
Lift up the wooden tabletop to lap height as necessary. Lower down the tabletop as a normal coffee table.

### Specifications
Assembly required - Minor assembly required. Attach the glass legs to the table and it is ready to use. Cleaning and Care - Mild soap and water with a soft cloth.Do not use abrasive cleaning products or chemicals.Protected against mechanical impact.

**Dimensions:** 1200*700mm

**Material:** Wooden + Steel + Glass', 'The minimalist coffee table in a simple design comes with wooden tabletop and glass legs. Lifts up the table to lap height at 650mm, an ideal and comfortable height for working, playing or sharing a meal.A high-capacity space hidden under the wooden tabletop can be used to store books,game playthings,snacks,remotes, or even your laptop computer.

### Features
Adjustable height - The coffee table at 330mm height lifts up to lap height at 650mm, an ideal and comfortable height for people to have more possibly working, playing or sharing a meal. Large storage - The high-capacity space hidden under the wooden tabletop offers a large storage to store away items like books,game playthings,snacks,remotes, or even your laptop computer. High quality materials - Table top made of E0 grade MDF.Metal frame made of carbon steel in power coating.Table legs made of glass. Simple design - With smooth tabletop and simple line glass legs,this minimalist coffee table fits more modern home.

### How It Works
Lift up the wooden tabletop to lap height as necessary. Lower down the tabletop as a normal coffee table.

### Specifications
Assembly required - Minor assembly required. Attach the glass legs to the table and it is ready to use. Cleaning and Care - Mild soap and water with a soft cloth.Do not use abrasive cleaning products or chemicals.Protected against mechanical impact.

**Dimensions:** 1200*700mm

**Material:** Wooden + Steel + Glass', '/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-table320b8.webp', '/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-table65a19cb5-a2d8-491e-8f54-fcf8867f95db.webp',
  ARRAY['/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-table320b8.webp', '/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-table65a19cb5-a2d8-491e-8f54-fcf8867f95db.webp', '/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-table9cc46bde-f6de-4e5e-8ff4-7be87643f765.webp', '/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-tablee9c9b.webp', '/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-tableed37a27d-3e48-4ad6-8f31-88c52f30f8e7.webp']::TEXT[], '', '2 ctns/pc'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  345, 'B2417-10M-GRC002+M021', '5061118254247', '5061118254247', 'Space Saving Dining Table B2417-10M - Ceramic gray top+dark gray frame',
  'space-saving-dining-table-b2417-10m-b2417-10m-ceramic-gray-top-dark-gray-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Ceramic gray top+dark gray frame', 1120.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  346, 'B2526-1M-W023+M010', '5061118254254', '5061118254254', 'Classical Multi-use Expanding Console Table - white glossy top+black frame',
  'classical-multi-use-expanding-console-table-b2526-1m-white-glossy-top-black-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white glossy top+black frame', 1010.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table can be used as a console table when it is not extended, you can put some books, water bottles, decorative paintings and so on on it; when this table is extended, it can be turned into a dining table, which can accommodate up to 8 people, and the tabletop size extends from 220*900mm to 1630*900mm, which is 7 times larger than the original tabletop size.

### Features
Extendable table size - The table top is extendable by 3 flexible top panels to enlarge the capacity to maximum 8 seaters. Space saving - The size of the table without extension is 220*900*755mm. High quality materials - Table top and table legs are made of E0 grade MDF with double-side synchronized texture melamine. Table frame is made of carbon steel and metal sliding rail.

### How It Works
Pull out either side of the table by sliding rail, and take out the extension panels from the storage rack to put on the table top. Put 1 to 3 extension panels for 4 different table length as preferred. Store the extensions panels on the metal rack and push to close it as a console table.

**Dimensions:** 220mm*900mm & 900mm*1630mm, extendable

**Material:** Wood + Metal', 'This table can be used as a console table when it is not extended, you can put some books, water bottles, decorative paintings and so on on it; when this table is extended, it can be turned into a dining table, which can accommodate up to 8 people, and the tabletop size extends from 220*900mm to 1630*900mm, which is 7 times larger than the original tabletop size.

### Features
Extendable table size - The table top is extendable by 3 flexible top panels to enlarge the capacity to maximum 8 seaters. Space saving - The size of the table without extension is 220*900*755mm. High quality materials - Table top and table legs are made of E0 grade MDF with double-side synchronized texture melamine. Table frame is made of carbon steel and metal sliding rail.

### How It Works
Pull out either side of the table by sliding rail, and take out the extension panels from the storage rack to put on the table top. Put 1 to 3 extension panels for 4 different table length as preferred. Store the extensions panels on the metal rack and push to close it as a console table.

**Dimensions:** 220mm*900mm & 900mm*1630mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table1d65d4d8-4559-499e-b14e-88523f2d42b0.webp', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table2f13d.webp',
  ARRAY['/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table1d65d4d8-4559-499e-b14e-88523f2d42b0.webp', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table2f13d.webp', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table591aeb82-ad93-4f8a-a23a-b732b3a762df.webp']::TEXT[], '96*28*81cm, 0.218CBM', '1pc/ctn'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  347, 'B2526-1M-W022+M010', '5061118254261', '5061118254261', 'Classical Multi-use Expanding Console Table - black glossy top+black frame',
  'classical-multi-use-expanding-console-table-b2526-1m-black-glossy-top-black-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'black glossy top+black frame', 1010.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This table can be used as a console table when it is not extended, you can put some books, water bottles, decorative paintings and so on on it; when this table is extended, it can be turned into a dining table, which can accommodate up to 8 people, and the tabletop size extends from 220*900mm to 1630*900mm, which is 7 times larger than the original tabletop size.

### Features
Extendable table size - The table top is extendable by 3 flexible top panels to enlarge the capacity to maximum 8 seaters. Space saving - The size of the table without extension is 220*900*755mm. High quality materials - Table top and table legs are made of E0 grade MDF with double-side synchronized texture melamine. Table frame is made of carbon steel and metal sliding rail.

### How It Works
Pull out either side of the table by sliding rail, and take out the extension panels from the storage rack to put on the table top. Put 1 to 3 extension panels for 4 different table length as preferred. Store the extensions panels on the metal rack and push to close it as a console table.

**Dimensions:** 220mm*900mm & 900mm*1630mm, extendable

**Material:** Wood + Metal', 'This table can be used as a console table when it is not extended, you can put some books, water bottles, decorative paintings and so on on it; when this table is extended, it can be turned into a dining table, which can accommodate up to 8 people, and the tabletop size extends from 220*900mm to 1630*900mm, which is 7 times larger than the original tabletop size.

### Features
Extendable table size - The table top is extendable by 3 flexible top panels to enlarge the capacity to maximum 8 seaters. Space saving - The size of the table without extension is 220*900*755mm. High quality materials - Table top and table legs are made of E0 grade MDF with double-side synchronized texture melamine. Table frame is made of carbon steel and metal sliding rail.

### How It Works
Pull out either side of the table by sliding rail, and take out the extension panels from the storage rack to put on the table top. Put 1 to 3 extension panels for 4 different table length as preferred. Store the extensions panels on the metal rack and push to close it as a console table.

**Dimensions:** 220mm*900mm & 900mm*1630mm, extendable

**Material:** Wood + Metal', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table1d65d4d8-4559-499e-b14e-88523f2d42b0.webp', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table2f13d.webp',
  ARRAY['/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table1d65d4d8-4559-499e-b14e-88523f2d42b0.webp', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table2f13d.webp', '/product-images/tables/b2526-1m-classical-multi-use-expanding-console-table/classical-multi-use-expanding-console-table591aeb82-ad93-4f8a-a23a-b732b3a762df.webp']::TEXT[], '96*28*81cm, 0.218CBM', '1pc/ctn'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  348, 'B2109-6M-W022+M004', '5061118254278', '5061118254278', 'Space Saving Dining Table B2109-6M - black glass top+silvery paint leg',
  'space-saving-dining-table-b2109-6m-b2109-6m-black-glass-top-silvery-paint-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'black glass top+silvery paint leg', 880.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  349, 'B2109-3M-GP010+M033', '5061118254285', '5061118254285', 'Space Saving Dining Table B2109-3M - black star glasss top+ golden leg',
  'space-saving-dining-table-b2109-3m-b2109-3m-black-star-glasss-top-golden-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'black star glasss top+ golden leg', 880.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  350, 'B2502-1M-W023', '5061118254292', '5061118254292', 'Space Saving Console & Desk Table B2502-1M - Glossy White cabinet +white glossy chair',
  'space-saving-console-desk-table-b2502-1m-b2502-1m-glossy-white-cabinet-white-glossy-chair', 'tables', 'Smart Tables', 'Console & Desk Table', 'Console & Desk Tables',
  'Glossy White cabinet +white glossy chair', 930.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  351, 'B2502-1M-W012', '5061118254308', '5061118254308', 'Space Saving Console & Desk Table B2502-1M - Matt White cabinet +Matt white chair',
  'space-saving-console-desk-table-b2502-1m-b2502-1m-matt-white-cabinet-matt-white-chair', 'tables', 'Smart Tables', 'Console & Desk Table', 'Console & Desk Tables',
  'Matt White cabinet +Matt white chair', 930.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  352, 'B2502-1M-W012', '5061118254315', '5061118254315', 'Space Saving Console & Desk Table B2502-1M - Matt White cabinet +Light wood chair',
  'space-saving-console-desk-table-b2502-1m-b2502-1m-matt-white-cabinet-light-wood-chair', 'tables', 'Smart Tables', 'Console & Desk Table', 'Console & Desk Tables',
  'Matt White cabinet +Light wood chair', 930.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  353, 'B2252-9M-M004', '5061118254322', '5061118254322', 'Top Round Convertible Dining Table - black glass top+silver leg',
  'top-round-convertible-dining-table-b2252-9m-black-glass-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'black glass top+silver leg', 770.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you’ve ever had to sacrifice furniture due to limited living space, then our product is the perfect solution for you. Our multi-functional table can be used as both a dining table and a coffee table, providing you with two different ways to use just one piece of furniture. This versatile table will save you space and make your living area more practical. Whether you want to enjoy a cozy meal or relax with a cup of coffee, our table can easily transform to cater to your needs.

### Features
Convertible. This table is sure to amaze you with its unique design and features. When not fully opened, this product has a unique shape that will appeal to the eyes of anyone who sees it. But once fully opened, you''ll be amazed at how it turns into a stunning round table, perfect for any occasion. It is not only convertible in shape, but also in use. This product is versatile and adaptable, perfect for those who want a piece of furniture that is versatile. It can be used as a coffee table, dining table, or centerpiece in any room in your home. When you need more space, simply open it up and become a round table that can comfortably sit multiple people.

### Specifications
No Assembly. The table can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ1200mm/1950mm

**Material:** Glass', 'If you’ve ever had to sacrifice furniture due to limited living space, then our product is the perfect solution for you. Our multi-functional table can be used as both a dining table and a coffee table, providing you with two different ways to use just one piece of furniture. This versatile table will save you space and make your living area more practical. Whether you want to enjoy a cozy meal or relax with a cup of coffee, our table can easily transform to cater to your needs.

### Features
Convertible. This table is sure to amaze you with its unique design and features. When not fully opened, this product has a unique shape that will appeal to the eyes of anyone who sees it. But once fully opened, you''ll be amazed at how it turns into a stunning round table, perfect for any occasion. It is not only convertible in shape, but also in use. This product is versatile and adaptable, perfect for those who want a piece of furniture that is versatile. It can be used as a coffee table, dining table, or centerpiece in any room in your home. When you need more space, simply open it up and become a round table that can comfortably sit multiple people.

### Specifications
No Assembly. The table can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ1200mm/1950mm

**Material:** Glass', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table49e60603-27c3-43f3-8b11-c47241542cea.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table5ceca8a7-0fc3-40e1-bbda-f97d6d001cf3.webp',
  ARRAY['/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table49e60603-27c3-43f3-8b11-c47241542cea.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table5ceca8a7-0fc3-40e1-bbda-f97d6d001cf3.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table854dd205-2d19-4cf5-92f5-07dff1219df1.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table99cc3158-1609-4aa2-a4e1-29958a0254e7.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  354, 'B2252-9M-M004', '5061118254339', '5061118254339', 'Top Round Convertible Dining Table - white glass top+silver leg',
  'top-round-convertible-dining-table-b2252-9m-white-glass-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white glass top+silver leg', 770.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'If you’ve ever had to sacrifice furniture due to limited living space, then our product is the perfect solution for you. Our multi-functional table can be used as both a dining table and a coffee table, providing you with two different ways to use just one piece of furniture. This versatile table will save you space and make your living area more practical. Whether you want to enjoy a cozy meal or relax with a cup of coffee, our table can easily transform to cater to your needs.

### Features
Convertible. This table is sure to amaze you with its unique design and features. When not fully opened, this product has a unique shape that will appeal to the eyes of anyone who sees it. But once fully opened, you''ll be amazed at how it turns into a stunning round table, perfect for any occasion. It is not only convertible in shape, but also in use. This product is versatile and adaptable, perfect for those who want a piece of furniture that is versatile. It can be used as a coffee table, dining table, or centerpiece in any room in your home. When you need more space, simply open it up and become a round table that can comfortably sit multiple people.

### Specifications
No Assembly. The table can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ1200mm/1950mm

**Material:** Glass', 'If you’ve ever had to sacrifice furniture due to limited living space, then our product is the perfect solution for you. Our multi-functional table can be used as both a dining table and a coffee table, providing you with two different ways to use just one piece of furniture. This versatile table will save you space and make your living area more practical. Whether you want to enjoy a cozy meal or relax with a cup of coffee, our table can easily transform to cater to your needs.

### Features
Convertible. This table is sure to amaze you with its unique design and features. When not fully opened, this product has a unique shape that will appeal to the eyes of anyone who sees it. But once fully opened, you''ll be amazed at how it turns into a stunning round table, perfect for any occasion. It is not only convertible in shape, but also in use. This product is versatile and adaptable, perfect for those who want a piece of furniture that is versatile. It can be used as a coffee table, dining table, or centerpiece in any room in your home. When you need more space, simply open it up and become a round table that can comfortably sit multiple people.

### Specifications
No Assembly. The table can be used after unpacking. Care & Cleaning - To clean the stool, simply use a damp cloth. Do not use abrasive liquid detergents. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steel or chrome legs. Glass table tops are not used on inside unfolded surfaces.

**Dimensions:** φ1200mm/1950mm

**Material:** Glass', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table49e60603-27c3-43f3-8b11-c47241542cea.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table5ceca8a7-0fc3-40e1-bbda-f97d6d001cf3.webp',
  ARRAY['/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table49e60603-27c3-43f3-8b11-c47241542cea.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table5ceca8a7-0fc3-40e1-bbda-f97d6d001cf3.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table854dd205-2d19-4cf5-92f5-07dff1219df1.webp', '/product-images/tables/b2252-9m-top-round-convertible-dining-table/top-round-convertible-dining-table99cc3158-1609-4aa2-a4e1-29958a0254e7.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  355, 'B2218-2M-M004+M010+W022', '5061118254346', '5061118254346', 'Space Saving Dining Table B2218-2M - black glossy MDF top+black frame+silver leg',
  'space-saving-dining-table-b2218-2m-b2218-2m-black-glossy-mdf-top-black-frame-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'black glossy MDF top+black frame+silver leg', 690.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  356, 'B2218-2M-ME002-1', '5061118254353', '5061118254353', 'Space Saving Dining Table B2218-2M - walnut MDF top+black frame/leg',
  'space-saving-dining-table-b2218-2m-b2218-2m-walnut-mdf-top-black-frame-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut MDF top+black frame/leg', 580.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  357, 'B2218-2M-ME003-1', '5061118254360', '5061118254360', 'Space Saving Dining Table B2218-2M - Black MDF top+black frame/leg',
  'space-saving-dining-table-b2218-2m-b2218-2m-black-mdf-top-black-frame-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Black MDF top+black frame/leg', 580.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  358, 'B2492M-ME018-1+M021', '5061118254377', '5061118254377', 'Saving Space Expandable Dining Table - walnut MDF top +Dark grey frame',
  'saving-space-expandable-dining-table-b2492m-walnut-mdf-top-dark-grey-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut MDF top +Dark grey frame', 1200.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This extendable coffee table turns into a dinning table from a small sized rectangular table to a middle even a larger table that accommodates up to 8 people suitably. This convertible table expands in the middle and optionally on the side, adjusts the height with the gas lifting mechanism, moves with the hidden wheels in the legs, which provides a great choice for a simple life.

### Features
Adjustable height - The table height can be adjusted between 455mm-760mm by the hydraulic gas lift system.

Extendable table size - The tabletop expands from a coffee sized rectangular table to a middle even a larger dinning table for 8 people. High-quality materials - The E0 grade MDF table top with nice melamine veneered. The table legs made by carbon steel. Move easily - With wheels hidden in the legs, the table is convenient to move. Space saving - The unique folding and expanding function allows it to save space.

### How It Works
Turn the gas lift handle to raise up or lower down the table. Release the gas lift handle to fix the height at any level preferred. Expands the tabletop in the middle and on the side as you need. Move the table by picking up the non wheel side.

### Specifications
No assembly required - Take out the table from package to use directly. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.Keep minimum one meter away from heating equipment or other heat sources. Keep away from direct sunlight. Finish - Glossy paints or wood textures. Panels are heat, stain and water resistant. Legs are powder coated steel legs. Packaging - Packing in 5-layer paper brown carton with PE foam as inner protection.

**Dimensions:** Smallest size:1200*830 mm, Mid size:1200*1130 mm, Large size:1550*1130 mm

**Material:** Wood, Steel', 'This extendable coffee table turns into a dinning table from a small sized rectangular table to a middle even a larger table that accommodates up to 8 people suitably. This convertible table expands in the middle and optionally on the side, adjusts the height with the gas lifting mechanism, moves with the hidden wheels in the legs, which provides a great choice for a simple life.

### Features
Adjustable height - The table height can be adjusted between 455mm-760mm by the hydraulic gas lift system.

Extendable table size - The tabletop expands from a coffee sized rectangular table to a middle even a larger dinning table for 8 people. High-quality materials - The E0 grade MDF table top with nice melamine veneered. The table legs made by carbon steel. Move easily - With wheels hidden in the legs, the table is convenient to move. Space saving - The unique folding and expanding function allows it to save space.

### How It Works
Turn the gas lift handle to raise up or lower down the table. Release the gas lift handle to fix the height at any level preferred. Expands the tabletop in the middle and on the side as you need. Move the table by picking up the non wheel side.

### Specifications
No assembly required - Take out the table from package to use directly. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.Keep minimum one meter away from heating equipment or other heat sources. Keep away from direct sunlight. Finish - Glossy paints or wood textures. Panels are heat, stain and water resistant. Legs are powder coated steel legs. Packaging - Packing in 5-layer paper brown carton with PE foam as inner protection.

**Dimensions:** Smallest size:1200*830 mm, Mid size:1200*1130 mm, Large size:1550*1130 mm

**Material:** Wood, Steel', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table0b333.webp', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table385876c4-a5d6-439c-b1e0-ce1a2a357ca9.webp',
  ARRAY['/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table0b333.webp', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table385876c4-a5d6-439c-b1e0-ce1a2a357ca9.webp', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table502844e8-52eb-4907-ab6e-1072bc0022a6.webp', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table5fae8635-f7c7-46e7-a484-98de620dbbb7.webp', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table830e8206-f82c-415c-b721-f12135dd77f2.webp', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-table84d74e60-e4a0-4777-a743-caacb189a722.webp', '/product-images/tables/b2492m-saving-space-expandable-dining-table/saving-space-expandable-dining-tablec82b8021-8720-4a4e-8d29-4d606006149d.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  359, 'B2396M-M014+W023', '5061118254384', '5061118254384', 'Space Saving Dining Table B2396M - WHITE GLASS Top+white based',
  'space-saving-dining-table-b2396m-b2396m-white-glass-top-white-based', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'WHITE GLASS Top+white based', 580.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  360, 'B2396M-M014+W023', '5061118254391', '5061118254391', 'Space Saving Dining Table B2396M - WHITE FROSTED GLASS Top+white based',
  'space-saving-dining-table-b2396m-b2396m-white-frosted-glass-top-white-based', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'WHITE FROSTED GLASS Top+white based', 640.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  361, 'B2396M-M019+W027', '5061118254407', '5061118254407', 'Space Saving Dining Table B2396M - TORTORA GLASS Top+khaki based',
  'space-saving-dining-table-b2396m-b2396m-tortora-glass-top-khaki-based', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'TORTORA GLASS Top+khaki based', 640.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  362, 'B2396M-M023+W033', '5061118254414', '5061118254414', 'Space Saving Dining Table B2396M - CREAM GLASS Top+cream based',
  'space-saving-dining-table-b2396m-b2396m-cream-glass-top-cream-based', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'CREAM GLASS Top+cream based', 640.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  363, 'B2396-1M-M019+W027', '5061118254421', '5061118254421', 'Space Saving Dining Table B2396-1M - TORTORA GLASS Top+khaki based',
  'space-saving-dining-table-b2396-1m-b2396-1m-tortora-glass-top-khaki-based', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'TORTORA GLASS Top+khaki based', 580.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  364, 'B2396-1M-M023+W033', '5061118254438', '5061118254438', 'Space Saving Dining Table B2396-1M - CREAM GLASS Top+cream based',
  'space-saving-dining-table-b2396-1m-b2396-1m-cream-glass-top-cream-based', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'CREAM GLASS Top+cream based', 580.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  365, 'B2396-1M-M023+W033', '5061118254445', '5061118254445', 'Space Saving Dining Table B2396-1M - CREAM FROSTED GLASS Top+cream based',
  'space-saving-dining-table-b2396-1m-b2396-1m-cream-frosted-glass-top-cream-based', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'CREAM FROSTED GLASS Top+cream based', 640.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  366, 'B2401M-M014+W023', '5061118254452', '5061118254452', 'Space Saving Dining Table B2401M - M014+W023+WHITE GLASS',
  'space-saving-dining-table-b2401m-b2401m-m014-w023-white-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M014+W023+WHITE GLASS', 840.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  367, 'B2401M-M016+W029', '5061118254469', '5061118254469', 'Space Saving Dining Table B2401M - M016+W029+KHAKI GLASS',
  'space-saving-dining-table-b2401m-b2401m-m016-w029-khaki-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M016+W029+KHAKI GLASS', 840.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  368, 'B2401M-M023+W033', '5061118254476', '5061118254476', 'Space Saving Dining Table B2401M - M023+W033+CREAM GLASS',
  'space-saving-dining-table-b2401m-b2401m-m023-w033-cream-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M023+W033+CREAM GLASS', 840.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  369, 'B2401M-M021+W027', '5061118254483', '5061118254483', 'Space Saving Dining Table B2401M - M021+W027+GREY CERAMIC SANDED GLASS',
  'space-saving-dining-table-b2401m-b2401m-m021-w027-grey-ceramic-sanded-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M021+W027+GREY CERAMIC SANDED GLASS', 880.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  370, 'B2402-1M-M014+W023', '5061118254490', '5061118254490', 'Space Saving Dining Table B2402-1M - M014+W023+WHITE GLASS',
  'space-saving-dining-table-b2402-1m-b2402-1m-m014-w023-white-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M014+W023+WHITE GLASS', 820.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  371, 'B2402-1M-M014+W023', '5061118254506', '5061118254506', 'Space Saving Dining Table B2402-1M - M014+W023+WHITE FROSTED GLASS',
  'space-saving-dining-table-b2402-1m-b2402-1m-m014-w023-white-frosted-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M014+W023+WHITE FROSTED GLASS', 860.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  372, 'B2402-1M-M016+W029', '5061118254513', '5061118254513', 'Space Saving Dining Table B2402-1M - M016+W029+KHAKI GLASS',
  'space-saving-dining-table-b2402-1m-b2402-1m-m016-w029-khaki-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M016+W029+KHAKI GLASS', 820.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  373, 'B2402-1M-M019+W027', '5061118254520', '5061118254520', 'Space Saving Dining Table B2402-1M - M019+W027+TORTORA FROSTED GLASS',
  'space-saving-dining-table-b2402-1m-b2402-1m-m019-w027-tortora-frosted-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M019+W027+TORTORA FROSTED GLASS', 860.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  374, 'B2402-1M-M023+W033', '5061118254537', '5061118254537', 'Space Saving Dining Table B2402-1M - M023+W033+CREAM GLASS',
  'space-saving-dining-table-b2402-1m-b2402-1m-m023-w033-cream-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M023+W033+CREAM GLASS', 820.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  375, 'B2402-1M-M023+W033', '5061118254544', '5061118254544', 'Space Saving Dining Table B2402-1M - M023+W033+CREAM FROSTED GLASS',
  'space-saving-dining-table-b2402-1m-b2402-1m-m023-w033-cream-frosted-glass', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'M023+W033+CREAM FROSTED GLASS', 860.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  376, 'C3332M-M004+Q004-1', '5061118254551', '5061118254551', 'Classic Wooden Folding Chair - M004 Silver Leg+Q004 Brown Back+R008 Brown Seat (C',
  'classic-wooden-folding-chair-c3332m-m004-silver-leg-q004-brown-back-r008-brown-seat', 'tables', 'Smart Tables', 'Chair', 'Chairs',
  'M004 Silver Leg+Q004 Brown Back+R008 Brown Seat (C', 130.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'Folding chairs, lightweight, stackable functional chairs that are easy to move and save space. Initially used for military purposes. Commonly used in training institutions, schools, public places, hospitals, restaurants, hotels, companies, homes and other places.

**Dimensions:** Chair Height(fold): 805mm, Chair Width: 466mm, Chair Length: 471mm

**Material:** Wood + Metal', 'Folding chairs, lightweight, stackable functional chairs that are easy to move and save space. Initially used for military purposes. Commonly used in training institutions, schools, public places, hospitals, restaurants, hotels, companies, homes and other places.

**Dimensions:** Chair Height(fold): 805mm, Chair Width: 466mm, Chair Length: 471mm

**Material:** Wood + Metal', '/product-images/tables/c3332m-classic-wooden-folding-chair/classic-wooden-folding-chairc3b41.webp', '/product-images/tables/c3332m-classic-wooden-folding-chair/p20240701102427679cc.webp',
  ARRAY['/product-images/tables/c3332m-classic-wooden-folding-chair/classic-wooden-folding-chairc3b41.webp', '/product-images/tables/c3332m-classic-wooden-folding-chair/p20240701102427679cc.webp']::TEXT[], '92.5*48*20.5cm, 0.091CBM', '4pcs/ctn'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  377, 'C3332M-M004+W023+R005', '5061118254568', '5061118254568', 'Classic Wooden Folding Chair - M004 Silver Leg+W023 White Gloss+R005 PU Seat (C33',
  'classic-wooden-folding-chair-c3332m-m004-silver-leg-w023-white-gloss-r005-pu-seat', 'tables', 'Smart Tables', 'Chair', 'Chairs',
  'M004 Silver Leg+W023 White Gloss+R005 PU Seat (C33', 130.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'Folding chairs, lightweight, stackable functional chairs that are easy to move and save space. Initially used for military purposes. Commonly used in training institutions, schools, public places, hospitals, restaurants, hotels, companies, homes and other places.

**Dimensions:** Chair Height(fold): 805mm, Chair Width: 466mm, Chair Length: 471mm

**Material:** Wood + Metal', 'Folding chairs, lightweight, stackable functional chairs that are easy to move and save space. Initially used for military purposes. Commonly used in training institutions, schools, public places, hospitals, restaurants, hotels, companies, homes and other places.

**Dimensions:** Chair Height(fold): 805mm, Chair Width: 466mm, Chair Length: 471mm

**Material:** Wood + Metal', '/product-images/tables/c3332m-classic-wooden-folding-chair/classic-wooden-folding-chairc3b41.webp', '/product-images/tables/c3332m-classic-wooden-folding-chair/p20240701102427679cc.webp',
  ARRAY['/product-images/tables/c3332m-classic-wooden-folding-chair/classic-wooden-folding-chairc3b41.webp', '/product-images/tables/c3332m-classic-wooden-folding-chair/p20240701102427679cc.webp']::TEXT[], '92.5*48*20.5cm, 0.091CBM', '4pcs/ctn'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  378, 'C3332-3M-M021+Q004-1+S047', '5061118254575', '5061118254575', 'Classic Wooden Folding Chair - M021 Dark Grey+Q004 Brown Back+S047 Fabric (C3332-',
  'classic-wooden-folding-chair-c3332-3m-m021-dark-grey-q004-brown-back-s047-fabric', 'tables', 'Smart Tables', 'Chair', 'Chairs',
  'M021 Dark Grey+Q004 Brown Back+S047 Fabric (C3332-', 120.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'Folding chairs, lightweight, stackable functional chairs that are easy to move and save space. Initially used for military purposes. Commonly used in training institutions, schools, public places, hospitals, restaurants, hotels, companies, homes and other places.

**Dimensions:** Chair Height(fold): 805mm, Chair Width: 466mm, Chair Length: 471mm

**Material:** Wood + Metal', 'Folding chairs, lightweight, stackable functional chairs that are easy to move and save space. Initially used for military purposes. Commonly used in training institutions, schools, public places, hospitals, restaurants, hotels, companies, homes and other places.

**Dimensions:** Chair Height(fold): 805mm, Chair Width: 466mm, Chair Length: 471mm

**Material:** Wood + Metal', '/product-images/tables/c3332m-classic-wooden-folding-chair/classic-wooden-folding-chairc3b41.webp', '/product-images/tables/c3332m-classic-wooden-folding-chair/p20240701102427679cc.webp',
  ARRAY['/product-images/tables/c3332m-classic-wooden-folding-chair/classic-wooden-folding-chairc3b41.webp', '/product-images/tables/c3332m-classic-wooden-folding-chair/p20240701102427679cc.webp']::TEXT[], '92.5*48*20.5cm, 0.091CBM', '4pcs/ctn'
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  379, 'C3415P-2M-M021+Q004-1+S047', '5061118254582', '5061118254582', 'Space Saving Chair C3415P-2M - M021 Dark Grey+Q004 Brown Back & Seat',
  'space-saving-chair-c3415p-2m-c3415p-2m-m021-dark-grey-q004-brown-back-seat', 'tables', 'Smart Tables', 'Chair', 'Chairs',
  'M021 Dark Grey+Q004 Brown Back & Seat', 150.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  380, 'A1351HM-W023+ME005-1+M004', '5061118254599', '5061118254599', 'Space Saving Coffee & Lifting Table A1351HM - White glossy /white MDF top+silver frame',
  'space-saving-coffee-lifting-table-a1351hm-a1351hm-white-glossy-white-mdf-top-silver-frame', 'tables', 'Smart Tables', 'Coffee & Lifting Table', 'Coffee & Lifting Tables',
  'White glossy /white MDF top+silver frame', 480.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  381, 'A1351M-ME032-1+M004', '5061118254605', '5061118254605', 'Space Saving Coffee & Lifting Table A1351M - Natural MDF top+silver frame',
  'space-saving-coffee-lifting-table-a1351m-a1351m-natural-mdf-top-silver-frame', 'tables', 'Smart Tables', 'Coffee & Lifting Table', 'Coffee & Lifting Tables',
  'Natural MDF top+silver frame', 440.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  382, 'A1388M-W023+ME005-1+M004', '5061118254612', '5061118254612', 'High Gloss Lifting Multi-use Coffee Table - White glossy /white MDF top+silver frame',
  'high-gloss-lifting-multi-use-coffee-table-a1388m-white-glossy-white-mdf-top-silver-frame', 'tables', 'Smart Tables', 'Coffee & Lifting Table', 'Coffee & Lifting Tables',
  'White glossy /white MDF top+silver frame', 480.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This multi-purpose coffee table with dual lift tops has a great storage that is a good choice for eat, study or work in any space. The table is a space-saving product that lifts and opens one way towards you and the other opens sideways optionally. This modern table is finished in a white high gloss paint and supported by streamlined chrome legs.

### Features
Convertible - This table can be used as a coffee table and can be converted into a studying or working table in a quick and convenient way. Height adjustable - The table top lifts and opens from the front and side. The table height can be adjusted from 415mm to 545mm. High capacity storage - The high-capacity space inside offers a good storage. High quality materials - Table top made of E0 grade MDF is finished in a white high gloss paint. Table legs made of carbon steel is chromed. Space saving - This versatile table fits space well with its unique design.

### How It Works
Raise up the table tops from front and side to become a versatile table as you need. Put things into the high-capacity storage inside the table as you need. Lower down the table tops as a coffee table.

### Specifications
Assembly - Minor assembly required. Attach the steel legs to the table and it is ready to use. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 600*1200mm

**Material:** Wooden, steel', 'This multi-purpose coffee table with dual lift tops has a great storage that is a good choice for eat, study or work in any space. The table is a space-saving product that lifts and opens one way towards you and the other opens sideways optionally. This modern table is finished in a white high gloss paint and supported by streamlined chrome legs.

### Features
Convertible - This table can be used as a coffee table and can be converted into a studying or working table in a quick and convenient way. Height adjustable - The table top lifts and opens from the front and side. The table height can be adjusted from 415mm to 545mm. High capacity storage - The high-capacity space inside offers a good storage. High quality materials - Table top made of E0 grade MDF is finished in a white high gloss paint. Table legs made of carbon steel is chromed. Space saving - This versatile table fits space well with its unique design.

### How It Works
Raise up the table tops from front and side to become a versatile table as you need. Put things into the high-capacity storage inside the table as you need. Lower down the table tops as a coffee table.

### Specifications
Assembly - Minor assembly required. Attach the steel legs to the table and it is ready to use. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact.

**Dimensions:** 600*1200mm

**Material:** Wooden, steel', '/product-images/tables/a1388m-high-gloss-lifting-multi-use-coffee-table/high-gloss-lifting-multi-use-coffee-tableb0f69714-0ec1-4c82-a430-cf93b23a2193.webp', '/product-images/tables/a1388m-high-gloss-lifting-multi-use-coffee-table/high-gloss-lifting-multi-use-coffee-tablecc537.webp',
  ARRAY['/product-images/tables/a1388m-high-gloss-lifting-multi-use-coffee-table/high-gloss-lifting-multi-use-coffee-tableb0f69714-0ec1-4c82-a430-cf93b23a2193.webp', '/product-images/tables/a1388m-high-gloss-lifting-multi-use-coffee-table/high-gloss-lifting-multi-use-coffee-tablecc537.webp', '/product-images/tables/a1388m-high-gloss-lifting-multi-use-coffee-table/high-gloss-lifting-multi-use-coffee-tabled8543e8d-20b7-47dc-a344-d9b5913317bb.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  383, 'B2232M-ME014-1+M004', '5061118254629', '5061118254629', 'Solid Wood Board Lifting Extension Dining Table - natural wood MDF top +silver leg',
  'solid-wood-board-lifting-extension-dining-table-b2232m-natural-wood-mdf-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'natural wood MDF top +silver leg', 1040.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This compact box table extends to a dinner table easily by its flexible extensions stored inside,which allows this stunning space saving table to fit in more homes.The height of the coffee table can be adjusted by the gas lifting mechanism.As a multi-functional table,it can be used for having daily meals with 8+ chairs,for cards,games,tea or coffee with companion cube stool.With the invisible wheels hidden beneath the leg, the table has a great mobility to free your space for activities.Tabletop made of solid wood and legs made of chromed carbon steel supports the durability and stability of the high quality table.

### Features
Expandable tabletop size - This table can be used as a coffee table to enjoy games or coffee in the afternoon and can also be converted into a dining table for a daily meal in the family time. Height adjustable - The table height is adjustable in millimeters form 355mm to 795mm. High quality material - Tabletop made of solid wood and legs made of chromed carbon steel to keep the table stable enough and protect it against damages and rots for a long time. Meticulous locks design - It has solid metal dowels to secure the extensions in place and also has rail locks to prevent. This results in a very stable table top that can handle elbows and bumps. Space saving - As a coffee table,it is a space saver due to the slim design.

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Moving the table - One half of the table has wheels hidden beneath the leg while the other side does not. Pick up the non wheel side to move the table.

**Dimensions:** 1200mm*800mm&2205mm*800mm,changeable. Moveable leaves - 3pcs, 335 x 800 mm each

**Material:** Solid wood ,carbon steel', 'This compact box table extends to a dinner table easily by its flexible extensions stored inside,which allows this stunning space saving table to fit in more homes.The height of the coffee table can be adjusted by the gas lifting mechanism.As a multi-functional table,it can be used for having daily meals with 8+ chairs,for cards,games,tea or coffee with companion cube stool.With the invisible wheels hidden beneath the leg, the table has a great mobility to free your space for activities.Tabletop made of solid wood and legs made of chromed carbon steel supports the durability and stability of the high quality table.

### Features
Expandable tabletop size - This table can be used as a coffee table to enjoy games or coffee in the afternoon and can also be converted into a dining table for a daily meal in the family time. Height adjustable - The table height is adjustable in millimeters form 355mm to 795mm. High quality material - Tabletop made of solid wood and legs made of chromed carbon steel to keep the table stable enough and protect it against damages and rots for a long time. Meticulous locks design - It has solid metal dowels to secure the extensions in place and also has rail locks to prevent. This results in a very stable table top that can handle elbows and bumps. Space saving - As a coffee table,it is a space saver due to the slim design.

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Moving the table - One half of the table has wheels hidden beneath the leg while the other side does not. Pick up the non wheel side to move the table.

**Dimensions:** 1200mm*800mm&2205mm*800mm,changeable. Moveable leaves - 3pcs, 335 x 800 mm each

**Material:** Solid wood ,carbon steel', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining18ab7.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining3bf8d.webp',
  ARRAY['/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining18ab7.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining3bf8d.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining48f4d.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-diningcff1c.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-diningd34f2.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dininge057f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  384, 'B2232M-ME053-1+M024', '5061118254636', '5061118254636', 'Solid Wood Board Lifting Extension Dining Table - natural wood MDF top +white leg',
  'solid-wood-board-lifting-extension-dining-table-b2232m-natural-wood-mdf-top-white-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'natural wood MDF top +white leg', 1040.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'This compact box table extends to a dinner table easily by its flexible extensions stored inside,which allows this stunning space saving table to fit in more homes.The height of the coffee table can be adjusted by the gas lifting mechanism.As a multi-functional table,it can be used for having daily meals with 8+ chairs,for cards,games,tea or coffee with companion cube stool.With the invisible wheels hidden beneath the leg, the table has a great mobility to free your space for activities.Tabletop made of solid wood and legs made of chromed carbon steel supports the durability and stability of the high quality table.

### Features
Expandable tabletop size - This table can be used as a coffee table to enjoy games or coffee in the afternoon and can also be converted into a dining table for a daily meal in the family time. Height adjustable - The table height is adjustable in millimeters form 355mm to 795mm. High quality material - Tabletop made of solid wood and legs made of chromed carbon steel to keep the table stable enough and protect it against damages and rots for a long time. Meticulous locks design - It has solid metal dowels to secure the extensions in place and also has rail locks to prevent. This results in a very stable table top that can handle elbows and bumps. Space saving - As a coffee table,it is a space saver due to the slim design.

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Moving the table - One half of the table has wheels hidden beneath the leg while the other side does not. Pick up the non wheel side to move the table.

**Dimensions:** 1200mm*800mm&2205mm*800mm,changeable. Moveable leaves - 3pcs, 335 x 800 mm each

**Material:** Solid wood ,carbon steel', 'This compact box table extends to a dinner table easily by its flexible extensions stored inside,which allows this stunning space saving table to fit in more homes.The height of the coffee table can be adjusted by the gas lifting mechanism.As a multi-functional table,it can be used for having daily meals with 8+ chairs,for cards,games,tea or coffee with companion cube stool.With the invisible wheels hidden beneath the leg, the table has a great mobility to free your space for activities.Tabletop made of solid wood and legs made of chromed carbon steel supports the durability and stability of the high quality table.

### Features
Expandable tabletop size - This table can be used as a coffee table to enjoy games or coffee in the afternoon and can also be converted into a dining table for a daily meal in the family time. Height adjustable - The table height is adjustable in millimeters form 355mm to 795mm. High quality material - Tabletop made of solid wood and legs made of chromed carbon steel to keep the table stable enough and protect it against damages and rots for a long time. Meticulous locks design - It has solid metal dowels to secure the extensions in place and also has rail locks to prevent. This results in a very stable table top that can handle elbows and bumps. Space saving - As a coffee table,it is a space saver due to the slim design.

### Specifications
No assembly required - This product is fully assembled out of the box and is ready to use right away. Cleaning and Care - Mild soap and water with a soft cloth. Do not use abrasive cleaning products or chemicals. Protected against mechanical impact. Moving the table - One half of the table has wheels hidden beneath the leg while the other side does not. Pick up the non wheel side to move the table.

**Dimensions:** 1200mm*800mm&2205mm*800mm,changeable. Moveable leaves - 3pcs, 335 x 800 mm each

**Material:** Solid wood ,carbon steel', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining18ab7.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining3bf8d.webp',
  ARRAY['/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining18ab7.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining3bf8d.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dining48f4d.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-diningcff1c.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-diningd34f2.webp', '/product-images/tables/b2232m-solid-wood-board-lifting-extension-dining-table/solid-wood-board-lifting-extension-dininge057f.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  385, 'B2293-2WM-M004', '5061118254643', '5061118254643', 'Space Saving Dining Table B2293-2WM - white galss top +silver leg',
  'space-saving-dining-table-b2293-2wm-b2293-2wm-white-galss-top-silver-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white galss top +silver leg', 1230.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  386, 'B2307-6M-ME032-1+M004', '5061118254650', '5061118254650', 'Space Saving Dining Table B2307-6M - Natural wood MDF top/leg +silver frame',
  'space-saving-dining-table-b2307-6m-b2307-6m-natural-wood-mdf-top-leg-silver-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Natural wood MDF top/leg +silver frame', 1350.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  387, 'B2307-6M-SM005+M010', '5061118254667', '5061118254667', 'Space Saving Dining Table B2307-6M - walnut solid wood boards top/leg +black frame',
  'space-saving-dining-table-b2307-6m-b2307-6m-walnut-solid-wood-boards-top-leg-black-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut solid wood boards top/leg +black frame', 1770.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  388, 'B2307PV-6M-SM007+M023-1', '5061118254674', '5061118254674', 'Space Saving Dining Table B2307PV-6M - oak solid wood boards top/leg +beige frame',
  'space-saving-dining-table-b2307pv-6m-b2307pv-6m-oak-solid-wood-boards-top-leg-beige-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'oak solid wood boards top/leg +beige frame', 1770.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  389, 'B2540M-SM008+M023-1', '5061118254681', '5061118254681', 'Space Saving Dining Table B2540M - oak solid wood boards top/leg +beige frame',
  'space-saving-dining-table-b2540m-b2540m-oak-solid-wood-boards-top-leg-beige-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'oak solid wood boards top/leg +beige frame', 2700.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  390, 'B2552M-ME069-1+W033-1+M023-1', '5061118254698', '5061118254698', 'Space Saving Dining Table B2552M - Beige MDF top/leg +beige frame',
  'space-saving-dining-table-b2552m-b2552m-beige-mdf-top-leg-beige-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Beige MDF top/leg +beige frame', 2170.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  391, 'B2501M-W023+M014', '5061118254704', '5061118254704', 'Space Saving Dining Table B2501M - white glossy top+white leg',
  'space-saving-dining-table-b2501m-b2501m-white-glossy-top-white-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white glossy top+white leg', 920.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  392, 'B2501M-ME005-1+M014', '5061118254711', '5061118254711', 'Space Saving Dining Table B2501M - white top+white leg',
  'space-saving-dining-table-b2501m-b2501m-white-top-white-leg', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'white top+white leg', 860.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  393, 'B2486-1M-M021+ME018-1', '5061118254728', '5061118254728', 'Adjustable Space Saving Console Table - walnut top+dark gray frame',
  'adjustable-space-saving-console-table-b2486-1m-walnut-top-dark-gray-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut top+dark gray frame', 490.0, 50, 'hidden', ARRAY['en']::TEXT[],
  'The console table with folding function and adjustment function can be used as a dining table in dining room for users to enjoy , and can also be used as a coffee table for users to enjoy coffee. The unique shape is the highlight of the table and attracts people''s attention very much

### Features
Adjustable size - When folded, this table is small and unobtrusive, perfect for working or dining alone. But when you have guests over, just leave the table open and you''ll have plenty of space for snacks and drinks. If you need to adjust the height of the table, it''s easy to do: When you want a coffee table, just fold the legs down to lower the height. If it is time to eat, the folded legs can be unfolded, turning the table into a 755 mm high dining table. Beautiful design - The design of the table leg is particularly interesting, and it succeeds in infusing a sense of history and culture into a modern piece of furniture inspired by traditional Chinese architecture, especially the windows that decorate these buildings. The pattern is absolutely stunning and it adds an incredibly unique element to the piece. It is also interesting that when it is used as a coffee table, you will notice that it seems to have a suspended effect that suspended on the ground, especially when the table top is not folded and completely covers the leg of the table.

### Specifications
No assembly required - It is ready to use out of the box. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steelor chrome legs. Glass tabletopsare not used on inside unfolded surfaces.

**Dimensions:** 1200mm*580mm-1160mm

**Material:** Wood', 'The console table with folding function and adjustment function can be used as a dining table in dining room for users to enjoy , and can also be used as a coffee table for users to enjoy coffee. The unique shape is the highlight of the table and attracts people''s attention very much

### Features
Adjustable size - When folded, this table is small and unobtrusive, perfect for working or dining alone. But when you have guests over, just leave the table open and you''ll have plenty of space for snacks and drinks. If you need to adjust the height of the table, it''s easy to do: When you want a coffee table, just fold the legs down to lower the height. If it is time to eat, the folded legs can be unfolded, turning the table into a 755 mm high dining table. Beautiful design - The design of the table leg is particularly interesting, and it succeeds in infusing a sense of history and culture into a modern piece of furniture inspired by traditional Chinese architecture, especially the windows that decorate these buildings. The pattern is absolutely stunning and it adds an incredibly unique element to the piece. It is also interesting that when it is used as a coffee table, you will notice that it seems to have a suspended effect that suspended on the ground, especially when the table top is not folded and completely covers the leg of the table.

### Specifications
No assembly required - It is ready to use out of the box. Finish - Glossy paints or wood textures. Panels are heat, stain & water resistant. Legs are powder coated steelor chrome legs. Glass tabletopsare not used on inside unfolded surfaces.

**Dimensions:** 1200mm*580mm-1160mm

**Material:** Wood', '/product-images/tables/b2486-1m-adjustable-space-saving-console-table/adjustable-space-saving-console-table2024013006115512a9a.webp', '/product-images/tables/b2486-1m-adjustable-space-saving-console-table/adjustable-space-saving-console-table50956.webp',
  ARRAY['/product-images/tables/b2486-1m-adjustable-space-saving-console-table/adjustable-space-saving-console-table2024013006115512a9a.webp', '/product-images/tables/b2486-1m-adjustable-space-saving-console-table/adjustable-space-saving-console-table50956.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  394, 'C3499M-SM007', '5061118254735', '5061118254735', 'Space Saving Benche C3499M - oak solid wood boards top/leg',
  'space-saving-benche-c3499m-c3499m-oak-solid-wood-boards-top-leg', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'oak solid wood boards top/leg', 1370.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  395, 'C3499M-SM005', '5061118254742', '5061118254742', 'Space Saving Benche C3499M - walnut solid wood boards top/leg',
  'space-saving-benche-c3499m-c3499m-walnut-solid-wood-boards-top-leg', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'walnut solid wood boards top/leg', 1370.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  396, 'B2479-1M-ME019-1+M021', '5061118254759', '5061118254759', 'Space Saving Dining Table B2479-1M - Natural melamine MDF top+dark gray frame',
  'space-saving-dining-table-b2479-1m-b2479-1m-natural-melamine-mdf-top-dark-gray-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Natural melamine MDF top+dark gray frame', 1210.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  397, 'B2539-1M-M023-1+HY004+HT001/Q017-1', '5061118254766', '5061118254766', 'Space Saving Dining Table B2539-1M - Beige MDF with veneer top+beige frame',
  'space-saving-dining-table-b2539-1m-b2539-1m-beige-mdf-with-veneer-top-beige-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Beige MDF with veneer top+beige frame', 1950.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  398, 'B2538-3M-M023-1+HY004+HT001/Q017-1', '5061118254773', '5061118254773', 'Space Saving Dining Table B2538-3M - Beige MDF with veneer top/leg+beige frame',
  'space-saving-dining-table-b2538-3m-b2538-3m-beige-mdf-with-veneer-top-leg-beige-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'Beige MDF with veneer top/leg+beige frame', 2760.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  399, 'B2538-3M-M014+ME005-1+ HT004/W012', '5061118254780', '5061118254780', 'Space Saving Dining Table B2538-3M - White MDF top/leg+white frame',
  'space-saving-dining-table-b2538-3m-b2538-3m-white-mdf-top-leg-white-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'White MDF top/leg+white frame', 1590.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  400, 'B2538-3M-M010+HY002+HT002/Q008', '5061118254797', '5061118254797', 'Space Saving Dining Table B2538-3M - walnut MDF with veneer top/leg+black frame',
  'space-saving-dining-table-b2538-3m-b2538-3m-walnut-mdf-with-veneer-top-leg-black-frame', 'tables', 'Smart Tables', 'Dining Table', 'Dining Tables',
  'walnut MDF with veneer top/leg+black frame', 2800.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  401, 'C3499-1M-M023-1+HY004+HT001/Q017-1', '5061118254803', '5061118254803', 'Space Saving Benche C3499-1M - M023-1+HY004+HT001/Q017-1',
  'space-saving-benche-c3499-1m-c3499-1m-m023-1-hy004-ht001-q017-1', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'M023-1+HY004+HT001/Q017-1', 1470.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  402, 'C3499-2M-M014+ME005-1+ HT004/W012', '5061118254810', '5061118254810', 'Space Saving Benche C3499-2M - M014+ME005-1+ HT004/W012',
  'space-saving-benche-c3499-2m-c3499-2m-m014-me005-1-ht004-w012', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'M014+ME005-1+ HT004/W012', 950.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();

INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  403, 'C3499-2M-M010+HY002+HT002/Q008', '5061118254827', '5061118254827', 'Space Saving Benche C3499-2M - M010+HY002+HT002/Q008',
  'space-saving-benche-c3499-2m-c3499-2m-m010-hy002-ht002-q008', 'tables', 'Smart Tables', 'Benche', 'Benches',
  'M010+HY002+HT002/Q008', 1530.0, 50, 'hidden', ARRAY['en']::TEXT[],
  '', '', '/hero2.webp', '/hero2.webp',
  ARRAY['/hero2.webp']::TEXT[], '', ''
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();