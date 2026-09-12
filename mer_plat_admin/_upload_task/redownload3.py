import requests, re, os

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
OUT = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(OUT, "js")
os.makedirs(JS, exist_ok=True)

html = open(os.path.join(OUT, "home2.html"), encoding="utf-8").read()

# locate the f function map precisely
marker = 'function f(c){return k.p+"static/js/"+({}[c]||c)+"."+'
i = html.find(marker)
print("marker idx", i)
j = html.find('[c]}', i)
mapstr = html[i+len(marker):j]
pairs = re.findall(r'"([\w-]+)":"([\w]+)"', mapstr)
chunkmap = dict(pairs)
print("chunk count:", len(chunkmap))
for k in sorted(chunkmap)[:5]:
    print(k, chunkmap[k])

for name, h in sorted(chunkmap.items()):
    u = "/static/js/%s.%s.js" % (name, h)
    fn = u.split("/")[-1]
    path = os.path.join(JS, fn)
    if os.path.exists(path) and os.path.getsize(path) > 20000:
        print("skip", fn)
        continue
    rr = requests.get(BASE + u, headers=UA, timeout=30, verify=False)
    if rr.status_code == 200 and len(rr.content) > 20000:
        open(path, "wb").write(rr.content)
        print("saved", fn, len(rr.content))
    else:
        print("MISS", fn, rr.status_code, len(rr.content))
