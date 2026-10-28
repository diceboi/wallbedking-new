import openpyxl
import os
import sys
import re
import gdown

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

download_results = {}

for idx, (link, models) in enumerate(link_to_models.items(), start=1):
    first_model, first_name = models[0]
    folder_slug = slugify(f"{first_model}-{first_name}") if first_name else slugify(first_model)
    target_dir = os.path.join(base_dir, folder_slug)
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"\n[{idx}/{len(link_to_models)}] Downloading for {first_model} ({first_name})")
    print(f"   Target: {target_dir}")
    print(f"   Link: {link}")
    
    try:
        # Extract folder ID
        fid_match = re.search(r'folders/([a-zA-Z0-9_-]+)', link)
        if not fid_match:
            print("   Could not extract folder ID!")
            download_results[link] = {'success': False, 'error': 'Invalid URL format'}
            continue
        fid = fid_match.group(1)
        folder_url = f"https://drive.google.com/drive/folders/{fid}"
        
        # Download all files in folder
        downloaded = gdown.download_folder(folder_url, output=target_dir, quiet=True, use_cookies=False)
        print(f"   Downloaded {len(downloaded) if downloaded else 0} files.")
        download_results[link] = {
            'success': True,
            'folder_slug': folder_slug,
            'target_dir': target_dir,
            'file_count': len(downloaded) if downloaded else 0,
            'files': [os.path.basename(f) for f in (downloaded or [])]
        }
    except Exception as e:
        print(f"   Error downloading: {e}")
        download_results[link] = {'success': False, 'error': str(e)}

import json
with open('download_summary.json', 'w', encoding='utf-8') as f:
    json.dump(download_results, f, ensure_ascii=False, indent=2)

print("\nDownload process completed! See download_summary.json for full summary.")
