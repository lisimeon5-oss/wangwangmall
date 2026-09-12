import re, json, os, requests

requests.packages.urllib3.disable_warnings()
OUT = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(OUT, "js")
html = open(os.path.join(OUT, "home.html"), encoding="utf-8", errors="ignore").read()

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
    mapping = json.loads(s[:end])

BASE = "https://yt.mer.sheep2.shop"
UA = {"User-Agent": "Mozilla/5.0"}
hits = []
for name, h in mapping.items():
    if name == "app" or name == "chunk-libs" or name == "runtime":
        continue
    fn = os.path.join(JS, "%s.%s.js" % (name, h))
    if not os.path.exists(fn):
        url = "%s/static/js/%s.%s.js" % (BASE, name, h)
        r = requests.get(url, headers=UA, timeout=30, verify=False)
        if r.status_code != 200:
            continue
        open(fn, "w", encoding="utf-8", errors="ignore").write(r.text)
    t = open(fn, encoding="utf-8", errors="ignore").read()
    # look for product delete/recycle/list page markers
    score = sum(t.count(k) for k in ["product/list", "batch/recycle", "handleDelete", "multipleSelection", "productDelete", "recycle", "删除", "回收站"])
    if score > 0:
        hits.append((name, h, score, len(t)))

hits.sort(key=lambda x: -x[2])
print("top candidate chunks:")
for x in hits[:20]:
    print(x)
