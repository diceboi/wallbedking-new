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

excel_rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(row): continue
    excel_rows.append({h: v for h, v in zip(headers, row) if h})

db_by_id = {str(p['id']): p for p in db_products if p.get('id') is not None}
excel_by_id = {str(r['ID']): r for r in excel_rows if r.get('ID') is not None}

def inspect_field(ex_col, db_col, limit=5):
    sys.stdout.buffer.write(f'=== DIFFS FOR {ex_col} vs db.{db_col} ===\n'.encode('utf-8'))
    cnt = 0
    for pid, ex_r in sorted(excel_by_id.items(), key=lambda x: int(x[0])):
        db_r = db_by_id.get(pid)
        if not db_r: continue
        v_ex = ex_r.get(ex_col)
        v_db = db_r.get(db_col)
        s_ex = '' if v_ex is None else str(v_ex).strip()
        s_db = '' if v_db is None else str(v_db).strip()
        if s_ex != s_db:
            cnt += 1
            if cnt <= limit:
                name = db_r.get("name") or ""
                msg = f'  ID {pid} ({name}):\n    DB:    {repr(s_db)[:100]}\n    Excel: {repr(s_ex)[:100]}\n'
                sys.stdout.buffer.write(msg.encode('utf-8'))
    msg2 = f'Total diffs: {cnt}\n\n'
    sys.stdout.buffer.write(msg2.encode('utf-8'))

inspect_field('SKU', 'sku')
inspect_field('Product Name (Default)', 'name')
inspect_field('Tags', 'tags')
inspect_field('Description', 'description')
inspect_field('Meta Description', 'meta_description')
inspect_field('Package Dimensions', 'package_dimensions')
inspect_field('Box 1', 'pack_1')
inspect_field('Box 2', 'pack_2')
inspect_field('Box 3', 'pack_3')
inspect_field('Box 4', 'pack_4')
