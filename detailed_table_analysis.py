import openpyxl
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
wb = openpyxl.load_workbook('New Products 2026.xlsx', data_only=True)
ws = wb['Space Savings tables']

rows = list(ws.iter_rows(values_only=True))
headers = [c for c in rows[3] if c is not None]

# Check column fill rates and samples
stats = {h: {'non_empty_count': 0, 'sample_values': []} for h in headers}

data_rows = []
for r_idx, r in enumerate(rows[4:], start=5):
    if not any(r): continue
    row_dict = {'_row': r_idx}
    for col_idx, h in enumerate(rows[3]):
        if h is not None and col_idx < len(r):
            val = r[col_idx]
            row_dict[h] = val
            if val is not None and str(val).strip() != "":
                stats[h]['non_empty_count'] += 1
                if len(stats[h]['sample_values']) < 3 and str(val) not in stats[h]['sample_values']:
                    stats[h]['sample_values'].append(str(val)[:80])
    data_rows.append(row_dict)

print(f"Total data rows: {len(data_rows)}")
print("\nColumn statistics (Fill count / 103):")
for h, s in stats.items():
    print(f"  - {h:28} : {s['non_empty_count']:3d}/103 | Samples: {s['sample_values'][:2]}")

# Let's inspect Photos specifically
photo_links = [r.get('Photos') for r in data_rows if r.get('Photos')]
print(f"\nTotal rows with Photos: {len(photo_links)}")
unique_photo_domains = set()
for p in photo_links:
    unique_photo_domains.add(p.split('/')[2] if '://' in str(p) else str(p)[:20])
print("Photo domains/types:", unique_photo_domains)

# Check models and how variants are represented
models_grouped = {}
for r in data_rows:
    m = r.get('MODEL') or r.get('Model number') or 'NO_MODEL'
    if m not in models_grouped:
        models_grouped[m] = []
    models_grouped[m].append(r)

print(f"\nUnique models: {len(models_grouped)}")

# Check category breakdown
categories = {}
for r in data_rows:
    desc = r.get('DESCRIPTIONS') or 'Unspecified'
    categories[desc] = categories.get(desc, 0) + 1
print("\nCategory breakdown (DESCRIPTIONS column):")
for c, cnt in sorted(categories.items(), key=lambda x: -x[1]):
    print(f"  - {c}: {cnt} items")

# Check missing critical fields
missing_names = [r['_row'] for r in data_rows if not r.get('Products name')]
missing_prices = [r['_row'] for r in data_rows if not r.get('Online Price incl Vat')]
missing_eans = [r['_row'] for r in data_rows if not r.get('GS1')]

print(f"\nMissing 'Products name': {len(missing_names)} rows (e.g. rows {missing_names[:5]})")
print(f"Missing 'Online Price incl Vat': {len(missing_prices)} rows")
print(f"Missing 'GS1' (barcode): {len(missing_eans)} rows")
