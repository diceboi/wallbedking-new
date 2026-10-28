import openpyxl
import json

wb = openpyxl.load_workbook('New Products 2026.xlsx', data_only=True)
ws = wb['Space Savings tables']

rows = list(ws.iter_rows(values_only=True))
headers = rows[3]
data_rows = rows[4:]

cols = [h for h in headers if h is not None]

products_summary = []
for idx, r in enumerate(data_rows):
    if not any(r): 
        continue
    row_dict = {'_excel_row': idx + 5}
    for col_idx, h in enumerate(headers):
        if h is not None and col_idx < len(r):
            row_dict[h] = r[col_idx]
    if row_dict.get('MODEL') or row_dict.get('Products name'):
        products_summary.append(row_dict)

models = {}
for p in products_summary:
    m = p.get('MODEL') or p.get('Model number') or 'UNKNOWN'
    if m not in models:
        models[m] = []
    models[m].append(p)

summary = {
    'total_rows': len(products_summary),
    'unique_models_count': len(models),
    'models': {}
}

for m, items in models.items():
    first = items[0]
    colors = [it.get('COLOUR') for it in items if it.get('COLOUR')]
    eans = [it.get('GS1') for it in items if it.get('GS1')]
    prices = [it.get('Online Price incl Vat') for it in items if it.get('Online Price incl Vat')]
    wholesale_gbp = [it.get('Wholesale UK GBP no Vat') for it in items if it.get('Wholesale UK GBP no Vat')]
    summary['models'][m] = {
        'variant_count': len(items),
        'category_desc': first.get('DESCRIPTIONS'),
        'product_name': first.get('Products name'),
        'feature': first.get('Feature') or first.get('Features'),
        'material': first.get('Material'),
        'table_size': first.get('Table Size'),
        'height': first.get('Height'),
        'weight': first.get('Weight'),
        'carton_size': first.get('Carton Size'),
        'colors': colors,
        'eans': eans,
        'prices': prices,
        'wholesale_gbp': wholesale_gbp,
        'has_description': bool(first.get('Description')),
        'has_specification': bool(first.get('Specification')),
        'has_how_it_works': bool(first.get('How does it work')),
        'sample_full_row': {k: str(v) for k, v in first.items() if v is not None}
    }

with open('products_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

print(f"Analysis complete: {len(products_summary)} rows across {len(models)} models.")
