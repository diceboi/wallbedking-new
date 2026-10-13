import json, urllib.request, openpyxl

# 1. Fetch Supabase products
supabase_url = 'https://unrqbejocbteebsworuq.supabase.co'
service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucnFiZWpvY2J0ZWVic3dvcnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYzNTU4NywiZXhwIjoyMTAzMjExNTg3fQ.wMOHLiuny-ZRwTL3Fw03H_bZk20FbEIjaj0WGZlcIn4'

req = urllib.request.Request(
    f'{supabase_url}/rest/v1/products?select=*',
    headers={'apikey': service_key, 'Authorization': f'Bearer {service_key}', 'Range': '0-999'}
)
with urllib.request.urlopen(req) as resp:
    db_products = json.loads(resp.read().decode('utf-8'))

wb = openpyxl.load_workbook(r'C:\Users\szasz\Downloads\wallbedking-products-filtered-2026-10-02%20%282%29.xlsx', data_only=True)
ws = wb.active
raw_headers = [cell.value for cell in ws[1]]

excel_rows = []
for row_idx in range(2, ws.max_row + 1):
    vals = [cell.value for cell in ws[row_idx]]
    if not any(vals): continue
    d = {h: v for h, v in zip(raw_headers, vals) if h}
    d['_row_idx'] = row_idx
    excel_rows.append(d)

# Inspect the rows with None ID
print("=== ROWS WITHOUT ID IN EXCEL ===")
for r in excel_rows:
    if r.get('ID') is None:
        print(f"Row {r['_row_idx']}: SKU={r.get('SKU')}, Name={r.get('Product Name (Default)')}, Slug={r.get('Slug')}, Parent={r.get('Parent Category')}")
        # print non-empty keys
        non_empty = {k: v for k, v in r.items() if v is not None and k != '_row_idx'}
        print("  Non-empty fields:", non_empty)

# Detailed analysis of deliberate data changes made in Excel:
db_by_id = {str(p.get('id')): p for p in db_products if p.get('id') is not None}
excel_by_id = {str(r.get('ID')): r for r in excel_rows if r.get('ID') is not None}

print("\n=== PRICE CHANGES IN EXCEL (10 products) ===")
for pid in sorted(excel_by_id.keys(), key=lambda x: int(x)):
    ex = excel_by_id[pid]
    db = db_by_id.get(pid)
    if not db: continue
    p_ex_gbp = ex.get('Price GBP')
    p_db_gbp = db.get('price_gbp')
    if p_ex_gbp is not None and str(p_ex_gbp) != str(p_db_gbp):
        print(f"ID {pid} ({db.get('name')}): GBP {p_db_gbp} -> {p_ex_gbp} | EUR {db.get('price_euro')} -> {ex.get('Price EUR')} | USD {db.get('price_usd')} -> {ex.get('Price USD')}")

print("\n=== WEIGHTS ADDED IN EXCEL ===")
weights_added = []
for pid in sorted(excel_by_id.keys(), key=lambda x: int(x)):
    ex = excel_by_id[pid]
    db = db_by_id.get(pid)
    if not db: continue
    w_ex = ex.get('Weight (kg)')
    w_db = db.get('weight')
    if w_ex and not w_db:
        weights_added.append((pid, db.get('name'), w_ex))
print(f"Total products where weight was filled in Excel: {len(weights_added)}")
for item in weights_added[:5]:
    print(f"  ID {item[0]} ({item[1]}): {item[2]} kg")

print("\n=== DIMENSION TWEAKS IN EXCEL ===")
for pid in sorted(excel_by_id.keys(), key=lambda x: int(x)):
    ex = excel_by_id[pid]
    db = db_by_id.get(pid)
    if not db: continue
    diffs = []
    for f_ex, f_db in [('Width (mm)', 'width'), ('Length (mm)', 'length'), ('Height (mm)', 'height'), 
                       ('Frame Width (mm)', 'frame_width'), ('Folded Up Height (mm)', 'folded_up_height'),
                       ('Folded Up Projection (mm)', 'folded_up_projection'), ('Folded Down Projection (mm)', 'folded_down_projection')]:
        if ex.get(f_ex) is not None and str(ex.get(f_ex)) != str(db.get(f_db) or ''):
            diffs.append(f"{f_db}: {db.get(f_db)} -> {ex.get(f_ex)}")
    if diffs:
        print(f"ID {pid} ({db.get('name')}): {', '.join(diffs)}")

print("\n=== TAGS IN EXCEL ===")
for pid in sorted(excel_by_id.keys(), key=lambda x: int(x)):
    ex = excel_by_id[pid]
    db = db_by_id.get(pid)
    if not db: continue
    if ex.get('Tags') != db.get('tags'):
        print(f"ID {pid} ({db.get('name')}): DB tags={db.get('tags')} -> Excel tags={ex.get('Tags')}")
