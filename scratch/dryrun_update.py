import ssl, urllib.request, json, openpyxl, sys
ssl._create_default_https_context = ssl._create_unverified_context

url = 'https://unrqbejocbteebsworuq.supabase.co/rest/v1/products?select=*'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucnFiZWpvY2J0ZWVic3dvcnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYzNTU4NywiZXhwIjoyMTAzMjExNTg3fQ.wMOHLiuny-ZRwTL3Fw03H_bZk20FbEIjaj0WGZlcIn4'
req = urllib.request.Request(url, headers={'apikey': key, 'Authorization': f'Bearer {key}', 'Range': '0-999'})
with urllib.request.urlopen(req) as resp:
    db_products = json.loads(resp.read().decode('utf-8'))

wb = openpyxl.load_workbook(r'C:\Users\szasz\Downloads\wallbedking-products-filtered-2026-10-02%20%282%29.xlsx', data_only=True)
ws = wb.active
headers = [c.value for c in ws[1]]

excel_rows = {}
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(row): continue
    d = {h: v for h, v in zip(headers, row) if h}
    pid = d.get('ID')
    if pid is not None and str(pid).strip() != '':
        excel_rows[str(pid).strip()] = d

# Swap 52 and 53 names in excel_rows to correct the spreadsheet inversion
if '52' in excel_rows and '53' in excel_rows:
    swap_cols = ['Name EN (UK)', 'Name US', 'Name DE', 'Name FR', 'Name ES', 'Name PT', 'Name POR', 'Name IT', 'Meta Title', 'Product Name (Default)']
    temp_52 = {col: excel_rows['52'].get(col) for col in swap_cols}
    for col in swap_cols:
        excel_rows['52'][col] = excel_rows['53'].get(col)
        excel_rows['53'][col] = temp_52.get(col)

db_by_id = {str(p['id']): p for p in db_products if p.get('id') is not None}

updates = {}
field_change_counts = {}

def clean_val(v):
    if v is None: return None
    if isinstance(v, float) and v.is_integer(): return int(v)
    if isinstance(v, str):
        v = v.strip()
        return v if v else None
    return v

for pid, ex in excel_rows.items():
    db = db_by_id.get(pid)
    if not db: continue
    
    patch = {}
    
    # 1. Prices
    for ex_k, db_k in [
        ('Price GBP', 'price_gbp'), ('Price EUR', 'price_euro'), ('Price USD', 'price_usd'),
        ('Sale Price GBP', 'sale_price_gbp'), ('Sale Price EUR', 'sale_price_euro'), ('Sale Price USD', 'sale_price_usd'),
        ('Sale %', 'sale_percent'), ('Sale Fix GBP', 'sale_fix_gbp'), ('Sale Fix EUR', 'sale_fix_euro'), ('Sale Fix USD', 'sale_fix_usd')
    ]:
        v = clean_val(ex.get(ex_k))
        if v is not None and str(v) != str(db.get(db_k) or ''):
            patch[db_k] = v

    # 2. Weight & Stock
    v_w = clean_val(ex.get('Weight (kg)'))
    if v_w is not None and str(v_w) != str(db.get('weight') or ''):
        patch['weight'] = v_w
        
    v_s = clean_val(ex.get('Stock'))
    if v_s is not None and str(v_s) != str(db.get('stock') or ''):
        patch['stock'] = int(v_s) if isinstance(v_s, (int, float)) or str(v_s).isdigit() else v_s

    # 3. Dimensions
    for ex_k, db_k in [
        ('Width (mm)', 'width'), ('Length (mm)', 'length'), ('Height (mm)', 'height'),
        ('Frame Width (mm)', 'frame_width'), ('Folded Up Height (mm)', 'folded_up_height'),
        ('Folded Up Projection (mm)', 'folded_up_projection'), ('Folded Down Projection (mm)', 'folded_down_projection'),
        ('Frame Distance From Ground (mm)', 'frame_distance_from_ground'), ('Mounting Frame Height (mm)', 'mounting_frame_height'),
        ('Maximum Mattress Depth (mm)', 'maximum_mattress_depth')
    ]:
        v = clean_val(ex.get(ex_k))
        if v is not None and str(v) != str(db.get(db_k) or ''):
            patch[db_k] = v

    # 4. Packaging & Boxes
    for ex_k, db_k in [
        ('Package Dimensions', 'package_dimensions'),
        ('Box 1', 'pack_1'), ('Box 2', 'pack_2'), ('Box 3', 'pack_3'), ('Box 4', 'pack_4')
    ]:
        v = clean_val(ex.get(ex_k))
        if v is not None and str(v) != str(db.get(db_k) or ''):
            patch[db_k] = v

    # 5. SKU
    v_sku = clean_val(ex.get('SKU'))
    if v_sku is not None and str(v_sku) != str(db.get('sku') or ''):
        patch['sku'] = str(v_sku)

    # 6. Tags
    v_tags = clean_val(ex.get('Tags'))
    if v_tags:
        current_tags = db.get('tags') or []
        if isinstance(current_tags, str):
            current_tags = [current_tags]
        if v_tags == 'best-seller' and 'best-seller' not in current_tags:
            patch['tags'] = ['best-seller']

    # 7. Localized Names
    for ex_k, db_k in [
        ('Name EN (UK)', 'name_en'), ('Name US', 'name_us'), ('Name DE', 'name_de'),
        ('Name FR', 'name_fr'), ('Name ES', 'name_es'), ('Name PT', 'name_pt'),
        ('Name POR', 'name_por'), ('Name IT', 'name_it')
    ]:
        v = clean_val(ex.get(ex_k))
        if v is not None and str(v) != str(db.get(db_k) or ''):
            patch[db_k] = v

    # 8. Meta & Descriptions
    for ex_k, db_k in [
        ('Meta Title', 'meta_title'),
        ('Meta Description', 'meta_description'),
        ('Description', 'description'),
        ('Product Image Alt', 'product_image_alt'),
        ('Warranty', 'warranty')
    ]:
        v = clean_val(ex.get(ex_k))
        if v is not None and str(v) != str(db.get(db_k) or ''):
            patch[db_k] = v

    if patch:
        updates[pid] = patch
        for k in patch:
            field_change_counts[k] = field_change_counts.get(k, 0) + 1

print(f"Total products needing updates: {len(updates)} / {len(db_products)}")
print("\n=== FIELD CHANGE COUNTS ===")
for k, count in sorted(field_change_counts.items(), key=lambda x: -x[1]):
    print(f"  {k:25}: {count} products")

print("\n=== SAMPLE PATCH (First 2 products) ===")
for pid in sorted(updates.keys(), key=lambda x: int(x))[:2]:
    print(f"\nID {pid}:")
    for k, v in updates[pid].items():
        print(f"  {k:20}: {repr(v)[:80]}")
