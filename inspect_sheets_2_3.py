import openpyxl
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
wb = openpyxl.load_workbook('New Products 2026.xlsx', data_only=True)

for sname in ['Sheet2', 'Sheet3']:
    ws = wb[sname]
    print(f"\n==================== {sname} ====================")
    rows = list(ws.iter_rows(values_only=True))
    non_empty = [r for r in rows if any(c is not None for c in r)]
    print(f"Total non-empty rows: {len(non_empty)}")
    for r in non_empty[:15]:
        print([str(c)[:50] if c is not None else None for c in r if c is not None])
