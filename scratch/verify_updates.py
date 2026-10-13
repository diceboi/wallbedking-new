import ssl, urllib.request, json, sys
ssl._create_default_https_context = ssl._create_unverified_context

url = 'https://unrqbejocbteebsworuq.supabase.co/rest/v1/products?id=in.(1,52,53,62,83,121)&select=id,name,sku,price_gbp,price_euro,weight,parent_category,category,image,ean,folded_up_projection,name_en,name_de,pack_1'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucnFiZWpvY2J0ZWVic3dvcnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYzNTU4NywiZXhwIjoyMTAzMjExNTg3fQ.wMOHLiuny-ZRwTL3Fw03H_bZk20FbEIjaj0WGZlcIn4'

req = urllib.request.Request(url, headers={'apikey': key, 'Authorization': f'Bearer {key}'})
with urllib.request.urlopen(req) as resp:
    prods = json.loads(resp.read().decode('utf-8'))

for p in sorted(prods, key=lambda x: x['id']):
    sys.stdout.buffer.write(f"\n=== Product ID {p['id']} ({p['name']}) ===\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  parent_cat: {p['parent_category']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  category:   {p['category']}\n".encode('utf-8'))
    img = (p['image'] or '')[:60]
    sys.stdout.buffer.write(f"  image:      {img}...\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  ean:        {p['ean']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  sku:        {p['sku']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  price_gbp:  {p['price_gbp']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  weight:     {p['weight']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  proj:       {p['folded_up_projection']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  pack_1:     {p['pack_1']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  name_en:    {p['name_en']}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"  name_de:    {p['name_de']}\n".encode('utf-8'))
