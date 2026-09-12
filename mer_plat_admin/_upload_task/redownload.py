import requests, re, os

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
OUT = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(OUT, "js")
os.makedirs(JS, exist_ok=True)

r = requests.get(BASE + "/", headers=UA, timeout=30, verify=False)
html = r.text
open(os.path.join(OUT, "home2.html"), "w", encoding="utf-8").write(html)

# precise extraction of the f() function map
m = re.search(r'function f\(c\)\{return [^}]*?\.\+(\{[^\n]*\})\[c\]', html)
print("f-map found:", bool(m))
if m:
    mapstr = m.group(1)
    pairs = re.findall(r'"([\w-]+)":"([\w]+)"', mapstr)
    chunkmap = dict(pairs)
    print("chunk count in f map:", len(chunkmap))
    for k in sorted(chunkmap):
        print(" ", k, chunkmap[k])

    # download all chunks in the f map
    for name, h in chunkmap.items():
        u = "/static/js/%s.%s.js" % (name, h)
        fn = u.split("/")[-1]
        path = os.path.join(JS, fn)
        if os.path.exists(path) and os.path.getsize(path) > 20000:
            continue
        rr = requests.get(BASE + u, headers=UA, timeout=30, verify=False)
        if rr.status_code == 200:
            open(path, "wb").write(rr.content)
            print("saved", fn, len(rr.content))
        else:
            print("fail", u, rr.status_code)
