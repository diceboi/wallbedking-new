import openpyxl
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
wb = openpyxl.load_workbook('New Products 2026.xlsx', data_only=True)
ws = wb['Space Savings tables']
rows = list(ws.iter_rows(values_only=True))

links = {}
for r in rows[4:]:
    if not any(r): continue
    model = r[2]
    name = r[13]
    photo = r[11]
    if photo:
        if photo not in links:
            links[photo] = []
        links[photo].append((model, name))

print(f"Unique Google Drive links: {len(links)}")
for l, models in links.items():
    print(f"\nLink: {l}")
    for m, n in models:
        print(f"  Model: {m} | Name: {n}")
