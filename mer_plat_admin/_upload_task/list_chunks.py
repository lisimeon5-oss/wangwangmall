import re, json, os, requests

requests.packages.urllib3.disable_warnings()
OUT = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(OUT, "js")
html = open(os.path.join(OUT, "home.html"), encoding="utf-8", errors="ignore").read()

# Extract the full chunk hash mapping (same technique as dl_product_chunks.py)
m = re.search(r'\+(\{[^}]*chunk-06cbec16[^}]*\})', html)
mapping = {}
if m:
    s = m.group(1)
    s = s[s.index('{'):]
    depth = 0
    end = 0
    for i, ch in enumerate(s):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    try:
        mapping = json.loads(s[:end])
    except Exception as e:
        print("parse err", e)

print("total chunks:", len(mapping))
for k, v in sorted(mapping.items()):
    print(k, v)
