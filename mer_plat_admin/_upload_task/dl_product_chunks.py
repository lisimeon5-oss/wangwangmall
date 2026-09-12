import re, json, os, requests

requests.packages.urllib3.disable_warnings()
OUT = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(OUT, "js")
html = open(os.path.join(OUT, "home.html"), encoding="utf-8", errors="ignore").read()

# find the chunk hash mapping: {"chunk-xxx":"hash", ...}
m = re.search(r'\+\{[^}]*chunk-06cbec16[^}]*\}', html)
print("match found:", bool(m))
if m:
    s = m.group(0)
    # the mapping starts with '{' 
    s = s[s.index('{'):]
    # extract balanced braces
    depth = 0
    end = 0
    for i, ch in enumerate(s):
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    mapping_str = s[:end]
    mapping = json.loads(mapping_str)
    for k in ["chunk-4a5f46a6", "chunk-10b7da86", "chunk-4d09e22a"]:
        print(k, "->", mapping.get(k))

BASE = "https://yt.mer.sheep2.shop"
UA = {"User-Agent": "Mozilla/5.0"}
for name in ["chunk-4a5f46a6", "chunk-10b7da86", "chunk-4d09e22a"]:
    h = mapping.get(name)
    if not h:
        continue
    url = f"{BASE}/static/js/{name}.{h}.js"
    r = requests.get(url, headers=UA, timeout=30, verify=False)
    fn = os.path.join(JS, f"{name}.{h}.js")
    open(fn, "w", encoding="utf-8", errors="ignore").write(r.text)
    print(f"{name}: {r.status_code} {len(r.text)} bytes -> {fn}")
