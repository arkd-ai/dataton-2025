import json
import sys
import os

filepath = '/home/arkade/Documents/github/dataton-2025/system_1/PDN_S1/states/Guerrero/completo.json'

def get_paths(data, prefix=""):
    paths = set()
    if isinstance(data, dict):
        for k, v in data.items():
            current_path = f"{prefix}.{k}" if prefix else k
            paths.add(current_path)
            paths.update(get_paths(v, current_path))
    elif isinstance(data, list):
        if len(data) > 0:
            # Inspect first few items in list to get representative structure
            for item in data[:5]: 
                paths.update(get_paths(item, prefix))
    return paths

try:
    print(f"Reading {filepath}...", flush=True)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}", flush=True)
        sys.exit(1)

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"Total records: {len(data)}", flush=True)
    
    all_paths = set()
    sample_size = min(len(data), 200)
    print(f"Scanning {sample_size} records for structure...", flush=True)
    
    for entry in data[:sample_size]:
        entry_paths = get_paths(entry)
        all_paths.update(entry_paths)
            
    print("\nAll Unique Paths Found (under declaracion):", flush=True)
    sorted_paths = sorted(list(all_paths))
    for p in sorted_paths:
        if p.startswith("declaracion"):
            print(p, flush=True)
        
except Exception as e:
    print(f"Error: {e}", flush=True)
