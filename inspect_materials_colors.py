import openpyxl
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
wb = openpyxl.load_workbook('New Products 2026.xlsx', data_only=True)
ws = wb['Space Savings tables']
rows = list(ws.iter_rows(values_only=True))

models = {}
for r in rows[4:]:
    if not any(r): continue
    m = r[2] # Col 3 MODEL
    if m not in models:
        models[m] = []
    models[m].append({
        'ean': r[1],
        'model': r[2],
        'category': r[3],
        'colour': r[4],
        'colour_model': r[5],
        'price_vat': r[8],
        'photos': r[11],
        'name': r[13],
        'material': r[16],
        'shape': r[17],
        'table_size': r[19]
    })

print(f"Total models: {len(models)}")

# Inspect models that have multiple variants
multi_variant_models = {m: v for m, v in models.items() if len(v) > 1}
print(f"Models with multiple variants: {len(multi_variant_models)}")

for m, v in list(multi_variant_models.items())[:10]:
    print(f"\nModel {m} ({len(v)} variants) - Name: {v[0]['name']} | Cat: {v[0]['category']}:")
    for item in v:
        print(f"   - Colour: {repr(item['colour'])} | Material: {repr(item['material'])} | Price: £{item['price_vat']} | EAN: {item['ean']}")
