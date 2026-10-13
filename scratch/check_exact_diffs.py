import json, urllib.request, openpyxl

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

db_by_id = {str(p.get('id')): p for p in db_products if p.get('id') is not None}
excel_by_id = {str(r.get('ID')): r for r in excel_rows if r.get('ID') is not None}

print("=== 1. PRICE CHANGES IN EXCEL (EXACT LIST) ===")
for pid in sorted(excel_by_id.keys(), key=lambda x: int(x)):
    ex = excel_by_id[pid]
    db = db_by_id.get(pid)
    if not db: continue
    diffs = []
    for cur, f_ex, f_db in [('GBP', 'Price GBP', 'price_gbp'), ('EUR', 'Price EUR', 'price_euro'), ('USD', 'Price USD', 'price_usd'),
                            ('Sale GBP', 'Sale Price GBP', 'sale_price_gbp'), ('Sale EUR', 'Sale Price EUR', 'sale_price_euro'), ('Sale USD', 'Sale Price USD', 'sale_price_usd')]:
        val_ex = ex.get(f_ex)
        val_db = db.get(f_db)
        if val_ex is not None and str(val_ex) != str(val_db or ''):
            diffs.append(f"{cur}: {val_db} -> {val_ex}")
    if diffs:
        print(f"ID {pid} | SKU: {db.get('sku')} | {db.get('name')}:")
        print(f"   {', '.join(diffs)}")

print("\n=== 2. DIMENSION CHANGES IN EXCEL (EXACT LIST) ===")
for pid in sorted(excel_by_id.keys(), key=lambda x: int(x)):
    ex = excel_by_id[pid]
    db = db_by_id.get(pid)
    if not db: continue
    diffs = []
    for label, f_ex, f_db in [('Width', 'Width (mm)', 'width'), ('Length', 'Length (mm)', 'length'), ('Height', 'Height (mm)', 'height'),
                             ('Frame Width', 'Frame Width (mm)', 'frame_width'),
                             ('Folded Up Height', 'Folded Up Height (mm)', 'folded_up_height'),
                             ('Folded Up Projection', 'Folded Up Projection (mm)', 'folded_up_projection'),
                             ('Folded Down Projection', 'Folded Down Projection (mm)', 'folded_down_projection'),
                             ('Mounting Frame Height', 'Mounting Frame Height (mm)', 'mounting_frame_height')]:
        val_ex = ex.get(f_ex)
        val_db = db.get(f_db)
        if val_ex is not None and str(val_ex) != str(val_db or ''):
            diffs.append(f"{label}: {val_db} -> {val_ex}")
    if diffs:
        print(f"ID {pid} | SKU: {db.get('sku')} | {db.get('name')}:")
        print(f"   {', '.join(diffs)}")

print("\n=== 3. STOCK & VISIBILITY DIFFERENCES ===")
for pid in sorted(excel_by_id.keys(), key=lambda x: int(x)):
    ex = excel_by_id[pid]
    db = db_by_id.get(pid)
    if not db: continue
    if str(ex.get('Stock')) != str(db.get('stock')):
        print(f"Stock diff -> ID {pid} ({db.get('name')}): DB={db.get('stock')} vs Excel={ex.get('Stock')}")
    if str(ex.get('Visibility')) != str(db.get('visibility')):
        print(f"Visibility diff -> ID {pid} ({db.get('name')}): DB={db.get('visibility')} vs Excel={ex.get('Visibility')}")
