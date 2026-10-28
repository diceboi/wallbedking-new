import openpyxl
import os
import sys
import re
import requests
from gdown.download_folder import _parse_embedded_folder_view

sys.stdout.reconfigure(encoding='utf-8')
wb = openpyxl.load_workbook('New Products 2026.xlsx', data_only=True)
ws = wb['Space Savings tables']
rows = list(ws.iter_rows(values_only=True))

def slugify(text):
    text = str(text or '').lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text

# Map each unique photo link to its models
link_to_models = {}
for r in rows[4:]:
    if not any(r): continue
    model = str(r[2] or '').strip()
    name = str(r[13] or '').strip()
    photo = str(r[11] or '').strip()
    if photo and 'drive.google.com' in photo:
        if photo not in link_to_models:
            link_to_models[photo] = []
        link_to_models[photo].append((model, name))

print(f"Total unique Google Drive links: {len(link_to_models)}")

base_dir = os.path.join('public', 'product-images', 'tables')
os.makedirs(base_dir, exist_ok=True)

sess = requests.Session()
sess.headers.update({'User-Agent': 'Mozilla/5.0'})

total_downloaded = 0
results = {}

for idx, (link, models) in enumerate(link_to_models.items(), start=1):
    first_model, first_name = models[0]
    folder_slug = slugify(f"{first_model}-{first_name}") if first_name else slugify(first_model)
    target_dir = os.path.join(base_dir, folder_slug)
    os.makedirs(target_dir, exist_ok=True)

    fid_match = re.search(r'folders/([a-zA-Z0-9_-]+)', link)
    if not fid_match:
        print(f"[{idx}/{len(link_to_models)}] Skipping invalid link: {link}")
        continue
    fid = fid_match.group(1)

    print(f"[{idx}/{len(link_to_models)}] {first_model} -> {folder_slug} (Folder ID: {fid})")

    try:
        folder_name, children = _parse_embedded_folder_view(sess=sess, folder_id=fid, verify=True, timeout=15)
        downloaded_files = []
        for file_id, file_name, mime in children:
            file_path = os.path.join(target_dir, file_name)
            # If already exists with non-zero size, skip
            if os.path.exists(file_path) and os.path.getsize(file_path) > 1000:
                downloaded_files.append(file_name)
                continue

            dl_url = f"https://drive.google.com/uc?export=download&id={file_id}"
            resp = sess.get(dl_url, timeout=20)
            if resp.status_code == 200 and len(resp.content) > 100:
                with open(file_path, 'wb') as f:
                    f.write(resp.content)
                downloaded_files.append(file_name)
                total_downloaded += 1
            else:
                print(f"   Failed to download {file_name} (Status {resp.status_code})")

        print(f"   Success: {len(downloaded_files)} files ready.")
        results[first_model] = {
            'folder_slug': folder_slug,
            'models': [m for m, n in models],
            'files': downloaded_files
        }
    except Exception as e:
        print(f"   Error fetching folder {fid}: {e}")

import json
with open('all_downloaded_images.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nAll downloads completed! Total newly downloaded files: {total_downloaded}")
