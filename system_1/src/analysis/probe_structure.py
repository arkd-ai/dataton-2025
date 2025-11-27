import json
import os

file_path = '/home/arkade/Documents/github/dataton-2025/system_1/PDN_S1/states/Aguascalientes/completo.json'

with open(file_path, 'r', encoding='utf-8') as f:
    # Read a chunk large enough to contain at least one full record, hopefully.
    # Actually, since it's a list, I can try to parse the first few bytes, but manual parsing is risky.
    # Let's try to read the file with a limit, but `read_file` tool already did that.
    # Better to use a script that loads the json properly but maybe just the first item if I could.
    # Since it's a 900MB file, loading it all in a probe script is slow.
    # I'll use `ijson` if available, or just load it.
    # Given the environment, I'll try to load it. If it crashes, I'll know.
    # But wait, I can use `ijson` if I install it? No, I shouldn't install things.
    # I will try to read the file line by line and manually extract the first object roughly to check keys.
    pass

# Let's just load it. 900MB is usually fine in modern environments (needs ~2-3GB RAM).
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, list) and len(data) > 0:
            first = data[0]
            print("Top keys:", first.keys())
            if 'declaracion' in first:
                print("Declaracion keys:", first['declaracion'].keys())
                if 'situacionPatrimonial' in first['declaracion']:
                    print("SitPatrimonial keys:", first['declaracion']['situacionPatrimonial'].keys())
                if 'interes' in first['declaracion']:
                    print("Interes keys:", first['declaracion']['interes'].keys())
except Exception as e:
    print(f"Error: {e}")
