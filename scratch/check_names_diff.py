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

print("=== SAMPLE NAME DIFFERENCES (First 5 products) ===")
for pid in ['1', '2', '45', '83', '195']:
    db = db_by_id.get(pid)
    ex = excel_by_id.get(pid)
    if not db or not ex: continue
    print(f"\n--- Product ID {pid} ({db.get('name')}) ---")
    print(f"  DB name_en:       {repr(db.get('name_en'))}")
    print(f"  Excel Name EN:    {repr(ex.get('Name EN (UK)'))}")
    print(f"  DB name_de:       {repr(db.get('name_de'))}")
    print(f"  Excel Name DE:    {repr(ex.get('Name DE'))}")
    print(f"  DB meta_title:    {repr(db.get('meta_title'))}")
    print(f"  Excel Meta Title: {repr(ex.get('Meta Title'))}")
