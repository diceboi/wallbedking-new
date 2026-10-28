import openpyxl
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('New Products 2026.xlsx', data_only=True)
ws = wb['Space Savings tables']
rows = list(ws.iter_rows(values_only=True))

def slugify(text):
    text = str(text or '').lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text

# Load downloaded images map
with open('all_downloaded_images.json', encoding='utf-8') as f:
    images_map = json.load(f)

# Normalize category / subcategory
def get_sub_category(desc):
    desc_str = str(desc or '').lower().strip()
    if 'dining table' in desc_str:
        return 'Dining Tables'
    if 'coffee' in desc_str:
        return 'Coffee & Lifting Tables'
    if 'desk' in desc_str or 'cabenit' in desc_str or 'console' in desc_str:
        return 'Console & Desk Tables'
    if 'cube' in desc_str or 'stool' in desc_str:
        return 'Cube Stools'
    if 'bench' in desc_str:
        return 'Benches'
    if 'chair' in desc_str:
        return 'Chairs'
    return 'Dining Tables'

def get_real_images(model):
    if model in images_map and images_map[model].get('files'):
        folder = images_map[model]['folder_slug']
        return [f"/product-images/tables/{folder}/{f}" for f in images_map[model]['files']]
    
    for k, v in images_map.items():
        if model in v.get('models', []):
            folder = v['folder_slug']
            return [f"/product-images/tables/{folder}/{f}" for f in v['files']]
            
    base_dir = os.path.join('public', 'product-images', 'tables')
    if os.path.exists(base_dir):
        m_slug = slugify(model)
        for d in os.listdir(base_dir):
            if d.startswith(m_slug):
                files = os.listdir(os.path.join(base_dir, d))
                webp_files = [f for f in files if f.endswith('.webp')]
                if webp_files:
                    return [f"/product-images/tables/{d}/{f}" for f in webp_files]
                
    return []

# Collect model metadata
model_meta = {}
name_models_map = {}

for idx, r in enumerate(rows[4:], start=5):
    if not any(r): continue
    model = str(r[2] or '').strip().replace('\n', '')
    if not model: continue
    
    name = str(r[13] or '').strip() if r[13] else ''
    desc = str(r[12] or '').strip() if r[12] else ''
    features = str(r[28] or '').strip() if r[28] else ''
    specs = str(r[30] or '').strip() if r[30] else ''
    how_it_works = str(r[32] or '').strip() if r[32] else ''
    material = str(r[16] or '').strip() if r[16] else ''
    shape = str(r[17] or '').strip() if r[17] else ''
    table_size = str(r[19] or '').strip() if r[19] else ''
    height = str(r[20] or '').strip() if r[20] else ''
    weight = str(r[21] or '').strip() if r[21] else ''
    carton_size = str(r[22] or '').strip() if r[22] else ''
    packing = str(r[23] or '').strip() if r[23] else ''
    application = str(r[24] or '').strip() if r[24] else ''
    design_style = str(r[25] or '').strip() if r[25] else ''
    category = str(r[3] or '').strip() if r[3] else 'Dining Table'
    photo = str(r[11] or '').strip() if r[11] else ''

    if name:
        if name not in name_models_map:
            name_models_map[name] = set()
        name_models_map[name].add(model)

    if model not in model_meta:
        model_meta[model] = {
            'name': name,
            'desc': desc,
            'features': features,
            'specs': specs,
            'how_it_works': how_it_works,
            'material': material,
            'shape': shape,
            'table_size': table_size,
            'height': height,
            'weight': weight,
            'carton_size': carton_size,
            'packing': packing,
            'application': application,
            'design_style': design_style,
            'category': category,
            'photo': photo
        }
    else:
        m = model_meta[model]
        if not m['name'] and name: m['name'] = name
        if not m['desc'] and desc: m['desc'] = desc
        if not m['features'] and features: m['features'] = features
        if not m['specs'] and specs: m['specs'] = specs
        if not m['how_it_works'] and how_it_works: m['how_it_works'] = how_it_works
        if not m['material'] and material: m['material'] = material
        if not m['shape'] and shape: m['shape'] = shape
        if not m['table_size'] and table_size: m['table_size'] = table_size
        if not m['height'] and height: m['height'] = height
        if not m['weight'] and weight: m['weight'] = weight
        if not m['carton_size'] and carton_size: m['carton_size'] = carton_size
        if not m['packing'] and packing: m['packing'] = packing
        if not m['application'] and application: m['application'] = application
        if not m['design_style'] and design_style: m['design_style'] = design_style
        if not m['photo'] and photo: m['photo'] = photo

def clean_color(c):
    c = str(c or '').strip().replace('\n', ' ')
    c = ' '.join(c.split())
    c = c.replace('Chair M021(dark grey paint)+Q004-1 brown backrest+S047 brown fabric', 'M021 Dark Grey+Q004 Brown Back+S047 Fabric')
    c = c.replace('M004 silvery leg+W023 whiteglossy backrest+R005 white PU seat', 'M004 Silver Leg+W023 White Gloss+R005 PU Seat')
    c = c.replace('M004 silvery leg+Q004-1 brown backrest+R008 brown seat', 'M004 Silver Leg+Q004 Brown Back+R008 Brown Seat')
    c = c.replace('M021(dark grey paint)+Q004-1 brown backrest and seat', 'M021 Dark Grey+Q004 Brown Back & Seat')
    if len(c) > 50:
        c = c[:50]
    return c

all_products = []
flagship_models = {}
seen_slugs = set()
start_id = 301

for idx, r in enumerate(rows[4:], start=5):
    if not any(r): continue
    model = str(r[2] or '').strip().replace('\n', '')
    if not model: continue

    meta = model_meta[model]
    sub_cat = get_sub_category(r[3] or meta['category'])
    
    product_name = meta['name']
    if not product_name:
        product_name = f"Space Saving {sub_cat.rstrip('s')} {model}"
    
    # Flagship slug is purely based on the product name so all model variants group under one flagship!
    flagship_slug = slugify(product_name)
    
    real_images = get_real_images(model)
    photo_cell = str(r[11] or '').strip()
    has_real_photo = bool(real_images and len(real_images) > 0)
    
    color_raw = clean_color(r[4])
    color_model = str(r[5] or '').strip().replace('\n', '')
    
    # If a product family has multiple models (e.g. B2241-4M and B2495M), include the model in the color display
    models_in_family = name_models_map.get(product_name, set())
    if len(models_in_family) > 1:
        color_display = f"{color_raw} ({model})"
    else:
        color_display = color_raw

    if len(color_display) > 50:
        color_display = color_display[:50]
    
    ean_raw = str(r[1] or '').strip()
    if ean_raw.endswith('.0'): ean_raw = ean_raw[:-2]
    
    online_price_vat = float(r[8] or 0)
    rrp_price_vat = float(r[9] or 0) if r[9] else None
    
    sku = f"{model}-{color_model}" if color_model else f"{model}-{slugify(color_raw)[:15]}"
    
    # Unique variant slug
    variant_slug = slugify(f"{flagship_slug}-{model}-{color_raw}")
    if variant_slug in seen_slugs:
        if color_model:
            variant_slug = slugify(f"{flagship_slug}-{model}-{color_raw}-{color_model}")
        if variant_slug in seen_slugs:
            variant_slug = f"{variant_slug}-{start_id}"
    seen_slugs.add(variant_slug)
    
    main_image = real_images[0] if real_images else "/hero2.webp"
    hover_image = real_images[1] if len(real_images) > 1 else main_image

    # Build rich description
    desc_parts = []
    if meta['desc']:
        desc_parts.append(meta['desc'])
    if meta['features']:
        desc_parts.append(f"### Features\n{meta['features']}")
    if meta['how_it_works']:
        desc_parts.append(f"### How It Works\n{meta['how_it_works']}")
    if meta['specs']:
        desc_parts.append(f"### Specifications\n{meta['specs']}")
    if meta['table_size']:
        desc_parts.append(f"**Dimensions:** {meta['table_size']}")
    if meta['material']:
        desc_parts.append(f"**Material:** {meta['material']}")

    full_description = "\n\n".join(desc_parts)

    item = {
        'id': start_id,
        'sku': sku,
        'ean': ean_raw,
        'ean_uk': ean_raw,
        'name': f"{product_name} - {color_display}",
        'title': product_name,
        'slug': variant_slug,
        'parent_slug': flagship_slug,
        'model': model,
        'parent_category': 'tables',
        'category': 'Smart Tables',
        'type': sub_cat.rstrip('s'),
        'sub_category': sub_cat,
        'color': color_display,
        'material': meta['material'] or 'MDF & Metal',
        'shape': meta['shape'] or 'Modern Space Saving',
        'table_size': meta['table_size'] or '',
        'dimensions': meta['table_size'] or '',
        'height': meta['height'] or '',
        'weight': meta['weight'] or '',
        'mechanism': meta['how_it_works'] or 'Transforming / Expanding Mechanism',
        'carton_size': meta['carton_size'] or '',
        'package_dimensions': meta['carton_size'] or '',
        'pack_1': meta['packing'] or meta['carton_size'] or '',
        'assembly': 'Light assembly required',
        'application': meta['application'] or 'Dining room, Living room, Home office',
        'design_style': meta['design_style'] or 'Modern Space Saver',
        'price_gbp': online_price_vat,
        'numericPrice': online_price_vat,
        'sale_price_gbp': None,
        'rrp_gbp': rrp_price_vat,
        'stock': 50,
        'visibility': 'Visible' if has_real_photo else 'hidden',
        'available_locales': ['en'],
        'description': full_description,
        'description_en': full_description,
        'image': main_image,
        'hover_image': hover_image,
        'hoverImage': hover_image,
        'product_images': real_images if real_images else ["/hero2.webp"],
        'has_real_photos': has_real_photo,
        'is_space_saving_table': True
    }
    
    all_products.append(item)
    
    # ONLY products with real photos become storefront flagship models!
    if has_real_photo:
        if flagship_slug not in flagship_models:
            flagship_models[flagship_slug] = {
                'id': f"flagship-table-{flagship_slug}",
                'rawId': f"table-{flagship_slug}",
                'model': model,
                'title': product_name,
                'name': product_name,
                'slug': flagship_slug,
                'parent_category': 'tables',
                'category': 'Smart Tables',
                'categoryKey': 'tables',
                'type': sub_cat.rstrip('s'),
                'sub_category': sub_cat,
                'image': main_image,
                'hoverImage': hover_image,
                'hover_image': hover_image,
                'product_images': list(real_images),
                'gallery': [{'src': img, 'alt': f"{product_name} view {i+1}"} for i, img in enumerate(real_images)],
                'price_gbp': online_price_vat,
                'numericPrice': online_price_vat,
                'price': f"from £{int(online_price_vat)}",
                'size': meta['table_size'] or 'Multi-size',
                'sizeLabel': meta['table_size'] or 'Multi-size',
                'badge': 'Space Saver',
                'description': full_description,
                'description_en': full_description,
                'link': f"/products/tables/{flagship_slug}",
                'available_locales': ['en'],
                'variants_count': 1,
                'min_price': online_price_vat,
                'material': meta['material'] or 'MDF & Metal',
                'shape': meta['shape'] or 'Modern Space Saving',
                'table_size': meta['table_size'] or '',
                'dimensions': meta['table_size'] or '',
                'height': meta['height'] or '',
                'weight': meta['weight'] or '',
                'mechanism': meta['how_it_works'] or 'Transforming / Expanding Mechanism',
                'carton_size': meta['carton_size'] or '',
                'package_dimensions': meta['carton_size'] or '',
                'pack_1': meta['packing'] or meta['carton_size'] or '',
                'assembly': 'Light assembly required',
                'application': meta['application'] or 'Dining room, Living room, Home office',
                'design_style': meta['design_style'] or 'Modern Space Saver'
            }
        else:
            flagship = flagship_models[flagship_slug]
            flagship['variants_count'] += 1
            if online_price_vat < flagship['min_price']:
                flagship['min_price'] = online_price_vat
                flagship['price_gbp'] = online_price_vat
                flagship['numericPrice'] = online_price_vat
                flagship['price'] = f"from £{int(online_price_vat)}"
            # Merge any additional images from other models in the same family
            for img in real_images:
                if img not in flagship['product_images']:
                    flagship['product_images'].append(img)
                    flagship['gallery'].append({'src': img, 'alt': f"{product_name} view {len(flagship['gallery'])+1}"})

    start_id += 1

print(f"Total processed variant items: {len(all_products)}")
print(f"Total visible items with photos: {sum(1 for p in all_products if p['visibility'] == 'Visible')}")
print(f"Total unique flagship models: {len(flagship_models)}")
print(f"Total unique slugs generated: {len(seen_slugs)}")

# Save to tables-catalog.json
with open('src/data/tables-catalog.json', 'w', encoding='utf-8') as f:
    json.dump({
        'variants': all_products,
        'flagships': list(flagship_models.values())
    }, f, ensure_ascii=False, indent=2)

print("Saved src/data/tables-catalog.json successfully.")

# Generate SQL migration file with visibility = 'hidden' for safe Supabase staging
sql_lines = [
    "-- ============================================================",
    "-- SPACE SAVING TABLES IMPORT (STAGING / HIDDEN IN PRODUCTION)",
    "-- Visibility set to 'hidden' so it does not affect live store",
    "-- ============================================================",
    "",
    "-- 1. Ensure column sizes can fit extended variant descriptions",
    "ALTER TABLE public.products ALTER COLUMN color TYPE VARCHAR(150);",
    "",
    "-- 2. Clean up any existing table items to avoid slug conflicts on re-run",
    "DELETE FROM public.products WHERE parent_category = 'tables' OR (id >= 301 AND id <= 500);",
    ""
]

for p in all_products:
    def esc(s):
        if s is None: return "NULL"
        return "'" + str(s).replace("'", "''") + "'"
    
    img_array = "ARRAY[" + ", ".join(esc(img) for img in p['product_images']) + "]::TEXT[]"
    locales_array = "ARRAY['en']::TEXT[]"
    
    # Store clean visibility: 'hidden' for all in DB to stay completely safe
    sql = f"""INSERT INTO public.products (
  id, sku, ean, ean_uk, name, slug, parent_category, category, type, sub_category,
  color, price_gbp, stock, visibility, available_locales, description, description_en,
  image, hover_image, product_images, package_dimensions, pack_1
) VALUES (
  {p['id']}, {esc(p['sku'])}, {esc(p['ean'])}, {esc(p['ean_uk'])}, {esc(p['name'])},
  {esc(p['slug'])}, {esc(p['parent_category'])}, {esc(p['category'])}, {esc(p['type'])}, {esc(p['sub_category'])},
  {esc(p['color'])}, {p['price_gbp']}, {p['stock']}, 'hidden', {locales_array},
  {esc(p['description'])}, {esc(p['description_en'])}, {esc(p['image'])}, {esc(p['hover_image'])},
  {img_array}, {esc(p['package_dimensions'])}, {esc(p['pack_1'])}
) ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_gbp = EXCLUDED.price_gbp,
  color = EXCLUDED.color,
  image = EXCLUDED.image,
  hover_image = EXCLUDED.hover_image,
  product_images = EXCLUDED.product_images,
  updated_at = NOW();"""
    sql_lines.append(sql)

with open('supabase/insert_space_saving_tables.sql', 'w', encoding='utf-8') as f:
    f.write("\n\n".join(sql_lines))

print("Saved supabase/insert_space_saving_tables.sql successfully.")
