import ssl, urllib.request, json, openpyxl, sys, re
ssl._create_default_https_context = ssl._create_unverified_context

SUPABASE_URL = 'https://unrqbejocbteebsworuq.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucnFiZWpvY2J0ZWVic3dvcnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYzNTU4NywiZXhwIjoyMTAzMjExNTg3fQ.wMOHLiuny-ZRwTL3Fw03H_bZk20FbEIjaj0WGZlcIn4'

# 1. Fetch current products from Supabase
req = urllib.request.Request(
    f'{SUPABASE_URL}/rest/v1/products?select=*',
    headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}', 'Range': '0-999'}
)
with urllib.request.urlopen(req) as resp:
    db_products = json.loads(resp.read().decode('utf-8'))

db_by_id = {str(p['id']): p for p in db_products if p.get('id') is not None}
print(f"Loaded {len(db_by_id)} products from Supabase.")

# 2. Load Excel
excel_path = r'C:\Users\szasz\Downloads\wallbedking-products-filtered-2026-10-02%20%282%29.xlsx'
wb = openpyxl.load_workbook(excel_path, data_only=True)
ws = wb.active
headers = [c.value for c in ws[1]]

excel_rows = {}
rows_without_id = []

for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
    if not any(row): continue
    d = {h: v for h, v in zip(headers, row) if h}
    pid = d.get('ID')
    if pid is not None and str(pid).strip() != '':
        excel_rows[str(pid).strip()] = d
    else:
        rows_without_id.append((row_idx, d))

print(f"Loaded {len(excel_rows)} product rows with ID from Excel.")
print(f"Found {len(rows_without_id)} draft rows without ID (skipped from auto-update).")

# 3. Fix the ID 52 vs ID 53 swap found in the Excel
if '52' in excel_rows and '53' in excel_rows:
    swap_cols = [
        'Name EN (UK)', 'Name US', 'Name DE', 'Name FR', 'Name ES',
        'Name PT', 'Name POR', 'Name IT', 'Meta Title', 'Product Name (Default)'
    ]
    temp_52 = {col: excel_rows['52'].get(col) for col in swap_cols}
    for col in swap_cols:
        excel_rows['52'][col] = excel_rows['53'].get(col)
        excel_rows['53'][col] = temp_52.get(col)
    print("Corrected inverted names/meta titles between ID 52 (100x190) and ID 53 (100x200).")

def clean_text(v):
    if v is None: return None
    s = str(v)
    s = re.sub(r'[\r\n]+', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s if s else None

def clean_multiline(v):
    if v is None: return None
    s = str(v).strip()
    return s if s else None

def clean_num(v):
    if v is None: return None
    if isinstance(v, (int, float)):
        return int(v) if float(v).is_integer() else float(v)
    s = str(v).strip()
    if not s: return None
    try:
        f = float(s)
        return int(f) if f.is_integer() else f
    except ValueError:
        return s

# 4. Build updates
updates_to_apply = []
stats = {}

for pid in sorted(excel_rows.keys(), key=lambda x: int(x)):
    db = db_by_id.get(pid)
    if not db:
        print(f"Warning: Product ID {pid} in Excel but not in DB.")
        continue
    ex = excel_rows[pid]
    patch = {}

    # --- Prices ---
    for ex_k, db_k in [
        ('Price GBP', 'price_gbp'), ('Price EUR', 'price_euro'), ('Price USD', 'price_usd'),
        ('Sale Price GBP', 'sale_price_gbp'), ('Sale Price EUR', 'sale_price_euro'), ('Sale Price USD', 'sale_price_usd'),
        ('Sale %', 'sale_percent'), ('Sale Fix GBP', 'sale_fix_gbp'), ('Sale Fix EUR', 'sale_fix_euro'), ('Sale Fix USD', 'sale_fix_usd')
    ]:
        v = clean_num(ex.get(ex_k))
        v_db = clean_num(db.get(db_k))
        if v is not None and v != v_db:
            patch[db_k] = v

    # --- Weight & Stock ---
    v_w = clean_num(ex.get('Weight (kg)'))
    v_w_db = clean_num(db.get('weight'))
    if v_w is not None and v_w != v_w_db:
        patch['weight'] = v_w

    v_stock = clean_num(ex.get('Stock'))
    v_stock_db = clean_num(db.get('stock'))
    if v_stock is not None and v_stock != v_stock_db:
        patch['stock'] = int(v_stock) if isinstance(v_stock, (int, float)) else v_stock

    # --- Dimensions ---
    for ex_k, db_k in [
        ('Width (mm)', 'width'), ('Length (mm)', 'length'), ('Height (mm)', 'height'),
        ('Frame Width (mm)', 'frame_width'), ('Folded Up Height (mm)', 'folded_up_height'),
        ('Folded Up Projection (mm)', 'folded_up_projection'), ('Folded Down Projection (mm)', 'folded_down_projection'),
        ('Frame Distance From Ground (mm)', 'frame_distance_from_ground'), ('Mounting Frame Height (mm)', 'mounting_frame_height'),
        ('Maximum Mattress Depth (mm)', 'maximum_mattress_depth')
    ]:
        v = clean_num(ex.get(ex_k))
        v_db = clean_num(db.get(db_k))
        if v is not None and v != v_db:
            patch[db_k] = v

    # --- Packaging & Boxes ---
    for ex_k, db_k in [
        ('Package Dimensions', 'package_dimensions'),
        ('Box 1', 'pack_1'), ('Box 2', 'pack_2'), ('Box 3', 'pack_3'), ('Box 4', 'pack_4')
    ]:
        v = clean_text(ex.get(ex_k))
        v_db = clean_text(db.get(db_k))
        if v is not None and v != v_db:
            patch[db_k] = v

    # --- SKU ---
    v_sku = clean_text(ex.get('SKU'))
    v_sku_db = clean_text(db.get('sku'))
    if v_sku is not None and v_sku != v_sku_db:
        patch['sku'] = v_sku

    # --- Tags ---
    v_tags = clean_text(ex.get('Tags'))
    if v_tags and v_tags == 'best-seller':
        current_tags = db.get('tags') or []
        if isinstance(current_tags, str):
            current_tags = [current_tags]
        if 'best-seller' not in current_tags:
            patch['tags'] = ['best-seller']

    # --- Localized Names ---
    for ex_k, db_k in [
        ('Name EN (UK)', 'name_en'), ('Name US', 'name_us'), ('Name DE', 'name_de'),
        ('Name FR', 'name_fr'), ('Name ES', 'name_es'), ('Name PT', 'name_pt'),
        ('Name POR', 'name_por'), ('Name IT', 'name_it')
    ]:
        v = clean_text(ex.get(ex_k))
        v_db = clean_text(db.get(db_k))
        if v is not None and v != v_db:
            patch[db_k] = v

    # --- Meta & Descriptions ---
    v_meta_title = clean_text(ex.get('Meta Title'))
    v_meta_title_db = clean_text(db.get('meta_title'))
    if v_meta_title is not None and v_meta_title != v_meta_title_db:
        patch['meta_title'] = v_meta_title

    v_meta_desc = clean_text(ex.get('Meta Description'))
    v_meta_desc_db = clean_text(db.get('meta_description'))
    if v_meta_desc is not None and v_meta_desc != v_meta_desc_db:
        patch['meta_description'] = v_meta_desc

    v_desc = clean_multiline(ex.get('Description'))
    v_desc_db = clean_multiline(db.get('description'))
    if v_desc is not None and v_desc != v_desc_db:
        patch['description'] = v_desc

    v_alt = clean_text(ex.get('Product Image Alt'))
    v_alt_db = clean_text(db.get('product_image_alt'))
    if v_alt is not None and v_alt != v_alt_db:
        patch['product_image_alt'] = v_alt

    v_war = clean_text(ex.get('Warranty'))
    v_war_db = clean_text(db.get('warranty'))
    if v_war is not None and v_war != v_war_db:
        patch['warranty'] = v_war

    if patch:
        updates_to_apply.append((pid, patch))
        for k in patch:
            stats[k] = stats.get(k, 0) + 1

print(f"\nPrepared updates for {len(updates_to_apply)} products.")
print("\n--- Summary of fields to be updated ---")
for k, cnt in sorted(stats.items(), key=lambda x: -x[1]):
    print(f"  {k:25}: {cnt} products")

# 5. Apply updates to Supabase
print("\nApplying updates to Supabase...")
success_count = 0
failed = []

for idx, (pid, patch) in enumerate(updates_to_apply, start=1):
    patch_url = f'{SUPABASE_URL}/rest/v1/products?id=eq.{pid}'
    req = urllib.request.Request(
        patch_url,
        data=json.dumps(patch).encode('utf-8'),
        headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type': 'application/json'
        },
        method='PATCH'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            if resp.status in (200, 204):
                success_count += 1
            else:
                failed.append((pid, f"Status {resp.status}"))
    except Exception as e:
        failed.append((pid, str(e)))

    if idx % 25 == 0 or idx == len(updates_to_apply):
        print(f"  Progress: {idx}/{len(updates_to_apply)} products processed...")

print(f"\nFinished! Successfully updated: {success_count} products.")
if failed:
    print(f"Errors occurred on {len(failed)} products:")
    for f in failed:
        print(f"  ID {f[0]}: {f[1]}")
else:
    print("All updates applied cleanly without any errors!")
