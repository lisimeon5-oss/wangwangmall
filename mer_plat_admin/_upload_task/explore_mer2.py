import requests, re, os

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
OUT = os.path.dirname(os.path.abspath(__file__))
JS_DIR = os.path.join(OUT, "js")
os.makedirs(JS_DIR, exist_ok=True)

r = requests.get(BASE + "/", headers=UA, timeout=30, verify=False)
html = r.text
open(os.path.join(OUT, "home.html"), "w", encoding="utf-8").write(html)

refs = re.findall(r'/static/(?:js|css)/[\w\.\-]+\.(?:js|css)', html)
print("REFS:")
for x in sorted(set(refs)):
    print(" ", x)

chunkmap = {}
for mm in re.finditer(r'"([\w-]+)":"([\w]+)"', html):
    chunkmap[mm.group(1)] = mm.group(2)

js_urls = set()
for ref in refs:
    if ref.endswith(".js"):
        js_urls.add(ref)
for name, h in chunkmap.items():
    js_urls.add("/static/js/%s.%s.js" % (name, h))

print("\nDownloading %d js files..." % len(js_urls))
keywords = ["login", "/admin/", "product", "upload", "category", "attr", "sku", "merchant", "baseURL", "Authori-zation", "token", "attrValue"]

result_lines = []
for u in sorted(js_urls):
    fn = u.split("/")[-1]
    path = os.path.join(JS_DIR, fn)
    if not os.path.exists(path):
        try:
            rr = requests.get(BASE + u, headers=UA, timeout=30, verify=False)
            if rr.status_code == 200:
                open(path, "wb").write(rr.content)
            else:
                print("  FAIL", u, rr.status_code)
                continue
        except Exception as e:
            print("  ERR", u, e)
            continue
    txt = open(path, encoding="utf-8", errors="ignore").read()
    low = txt.lower()
    hits = []
    for kw in keywords:
        cnt = low.count(kw.lower())
        if cnt:
            hits.append("%s=%d" % (kw, cnt))
    if hits:
        result_lines.append("%s : %s" % (fn, ", ".join(hits)))

open(os.path.join(OUT, "js_keyword_hits.txt"), "w", encoding="utf-8").write("\n".join(result_lines))
print("\nDone. Keyword hits:")
for line in result_lines[:120]:
    print(line)
