import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('products_analysis.json', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total rows: {data['total_rows']}")
print(f"Total unique models: {data['unique_models_count']}")

categories = {}
for m, d in data['models'].items():
    cat = d.get('category_desc') or 'Unspecified'
    categories[cat] = categories.get(cat, 0) + 1

print("\nModel counts by category description:")
for c, count in sorted(categories.items(), key=lambda x: -x[1]):
    print(f"  - {c}: {count} models")

print("\nDetailed list of first 15 models:")
for m, d in list(data['models'].items())[:15]:
    print(f"\nModel: {m}")
    print(f"  Name: {d.get('product_name')}")
    print(f"  Category: {d.get('category_desc')}")
    print(f"  Variants ({d['variant_count']}): {d['colors']}")
    print(f"  Prices (Online incl VAT): {d['prices']}")
    print(f"  Wholesale UK GBP: {d['wholesale_gbp']}")
    print(f"  Table Size: {d.get('table_size')}")
    print(f"  Height: {d.get('height')}")
    print(f"  Weight: {d.get('weight')}")
    print(f"  Carton Size: {d.get('carton_size')}")
    print(f"  Material: {d.get('material')}")
    print(f"  Has Rich Desc: {d['has_description']}, Spec: {d['has_specification']}, How it works: {d['has_how_it_works']}")

# Check images / photos column
print("\nChecking photos / images in sample rows:")
for m, d in list(data['models'].items())[:5]:
    sample = d['sample_full_row']
    print(f"Model {m} Photos cell: {repr(sample.get('Photos'))}")
