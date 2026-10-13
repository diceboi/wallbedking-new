import openpyxl

wb = openpyxl.load_workbook(r'C:\Users\szasz\Downloads\wallbedking-products-filtered-2026-10-02%20%282%29.xlsx', data_only=True)
ws = wb.active
raw_headers = [cell.value for cell in ws[1]]

corrupted_examples = {}
for r_idx in range(2, ws.max_row + 1):
    vals = [cell.value for cell in ws[r_idx]]
    for h, v in zip(raw_headers, vals):
        if v and '' in str(v):
            if h not in corrupted_examples:
                corrupted_examples[h] = []
            if len(corrupted_examples[h]) < 3:
                corrupted_examples[h].append(str(v)[:100])

print("=== COLUMNS WITH CHARACTER ENCODING ISSUES IN EXCEL ===")
for col, examples in corrupted_examples.items():
    print(f"\nColumn: {col} (e.g.)")
    for ex in examples:
        print(f"   {repr(ex)}")
