import json
import urllib.request
import openpyxl

# 1. Fetch Supabase products
supabase_url = 'https://unrqbejocbteebsworuq.supabase.co'
service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucnFiZWpvY2J0ZWVic3dvcnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYzNTU4NywiZXhwIjoyMTAzMjExNTg3fQ.wMOHLiuny-ZRwTL3Fw03H_bZk20FbEIjaj0WGZlcIn4'

req = urllib.request.Request(
    f'{supabase_url}/rest/v1/products?select=*',
    headers={'apikey': service_key, 'Authorization': f'Bearer {service_key}', 'Range': '0-999'}
)
with urllib.request.urlopen(req) as resp:
    db_products = json.loads(resp.read().decode('utf-8'))

# 2. Load Excel
excel_path = r'C:\Users\szasz\Downloads\wallbedking-products-filtered-2026-10-02%20%282%29.xlsx'
wb = openpyxl.load_workbook(excel_path, data_only=True)
ws = wb.active
raw_headers = [cell.value for cell in ws[1]]

excel_rows = []
for row_idx in range(2, ws.max_row + 1):
    vals = [cell.value for cell in ws[row_idx]]
    if not any(vals):
        continue
    d = {h: v for h, v in zip(raw_headers, vals) if h}
    d['_row_idx'] = row_idx
    excel_rows.append(d)

print(f"Total DB products: {len(db_products)}")
print(f"Total Excel rows: {len(excel_rows)}")

# Find empty or None ID rows in Excel
empty_id_rows = [r for r in excel_rows if r.get('ID') is None or str(r.get('ID')).strip() == '']
print(f"\nExcel rows with empty/None ID: {len(empty_id_rows)}")
for r in empty_id_rows:
    print(f"  Row {r['_row_idx']}: SKU={r.get('SKU')}, Name={r.get('Product Name (Default)')}, Slug={r.get('Slug')}")

# Index by ID (as string)
db_by_id = {str(p.get('id')): p for p in db_products if p.get('id') is not None}
excel_by_id = {str(r.get('ID')): r for r in excel_rows if r.get('ID') is not None and str(r.get('ID')).strip() != ''}

print(f"\nMatching IDs count: {len(set(db_by_id.keys()) & set(excel_by_id.keys()))}")
print(f"DB IDs not in Excel: {set(db_by_id.keys()) - set(excel_by_id.keys())}")
print(f"Excel IDs not in DB: {set(excel_by_id.keys()) - set(db_by_id.keys())}")

# Map of Excel column -> DB column
column_map = {
    'SKU': 'sku',
    'Product Name (Default)': 'name',
    'Name EN (UK)': 'name_en',
    'Name US': 'name_us',
    'Name DE': 'name_de',
    'Name FR': 'name_fr',
    'Name ES': 'name_es',
    'Name PT': 'name_pt',
    'Name POR': 'name_por',
    'Name IT': 'name_it',
    'Slug': 'slug',
    'Category Path': 'category',
    'Parent Category': 'parent_category',
    'Sub Category': 'sub_category',
    'Type': 'type',
    'Orientation': 'orientation',
    'Color': 'color',
    'Width (mm)': 'width',
    'Length (mm)': 'length',
    'Height (mm)': 'height',
    'Frame Width (mm)': 'frame_width',
    'Folded Up Height (mm)': 'folded_up_height',
    'Folded Up Projection (mm)': 'folded_up_projection',
    'Folded Down Projection (mm)': 'folded_down_projection',
    'Frame Distance From Ground (mm)': 'frame_distance_from_ground',
    'Mounting Frame Height (mm)': 'mounting_frame_height',
    'Maximum Mattress Depth (mm)': 'maximum_mattress_depth',
    'Weight (kg)': 'weight',
    'Stock': 'stock',
    'Visibility': 'visibility',
    'Price GBP': 'price_gbp',
    'Sale Price GBP': 'sale_price_gbp',
    'Sale Fix GBP': 'sale_fix_gbp',
    'Price EUR': 'price_euro',
    'Sale Price EUR': 'sale_price_euro',
    'Sale Fix EUR': 'sale_fix_euro',
    'Price USD': 'price_usd',
    'Sale Price USD': 'sale_price_usd',
    'Sale Fix USD': 'sale_fix_usd',
    'Sale %': 'sale_percent',
    'Master EAN': 'ean',
    'Tags': 'tags',
    'Warranty': 'warranty',
    'Image URL': 'image',
    'Hover Image URL': 'hover_image',
    'Gallery Images': 'product_images',
    'Product Image Alt': 'product_image_alt',
    'Meta Title': 'meta_title',
    'Meta Description': 'meta_description',
}

# Differences summary
diff_counts = {k: 0 for k in column_map}
sample_diffs = {k: [] for k in column_map}

def norm_val(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        return "; ".join(str(x) for x in v)
    return str(v).strip()

common_ids = sorted(list(set(db_by_id.keys()) & set(excel_by_id.keys())), key=lambda x: int(x) if x.isdigit() else x)

for pid in common_ids:
    db_p = db_by_id[pid]
    ex_p = excel_by_id[pid]
    for ex_col, db_col in column_map.items():
        ex_v = norm_val(ex_p.get(ex_col))
        db_v = norm_val(db_p.get(db_col))
        # Special check for parent category / category
        if ex_v != db_v:
            diff_counts[ex_col] += 1
            if len(sample_diffs[ex_col]) < 3:
                sample_diffs[ex_col].append({
                    'id': pid,
                    'sku': ex_p.get('SKU'),
                    'name': ex_p.get('Product Name (Default)'),
                    'excel': ex_v[:80],
                    'db': db_v[:80]
                })

print("\n=== DIFFERENCE SUMMARY BY COLUMN (out of " + str(len(common_ids)) + " products) ===")
for col, cnt in sorted(diff_counts.items(), key=lambda x: -x[1]):
    if cnt > 0:
        print(f"  {col} -> db.{column_map[col]}: {cnt} differences")
        for s in sample_diffs[col]:
            print(f"      [ID {s['id']}] Excel: {repr(s['excel'])}  VS  DB: {repr(s['db'])}")

# Check character encoding corruption in Excel
corrupted_names = []
for pid in common_ids:
    ex_p = excel_by_id[pid]
    for c in ['Product Name (Default)', 'Name EN (UK)', 'Name US', 'Name DE', 'Name FR', 'Name ES', 'Name PT', 'Name POR', 'Name IT', 'Description', 'Meta Title', 'Meta Description']:
        val = str(ex_p.get(c) or '')
        if '' in val:
            corrupted_names.append((pid, c, val[:60]))
            break

print(f"\n=== ENCODING CORRUPTIONS (containing '') IN EXCEL: {len(corrupted_names)} products ===")
for pid, c, val in corrupted_names[:10]:
    print(f"  [ID {pid}] in {c}: {val}")
