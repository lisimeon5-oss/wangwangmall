import requests, re, os, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
OUT = os.path.dirname(os.path.abspath(__file__))
JS_DIR = os.path.join(OUT, "js")
os.makedirs(JS_DIR, exist_ok=True)

r = requests.get(BASE + "/", headers=UA, timeout=30, verify=False)
html = r.text
open(os.path.join(OUT, "home.html"), "w", encoding="utf-8").write(html)

# extract script src and link href
refs = re.findall(r'(?:src|href)=["\'](/static/[^"\']+)["\']', html)
print("REFS:", refs)

# extract webpack runtime chunk map
m = re.search(r'\{(\{[^}]*\})\}\[', html)
print("runtime map found:", bool(m))

# parse the chunk name->hash map
chunkmap = {}
for mm in re.finditer(r'"([\w-]+)":"([\w]+)"', html):
    chunkmap[mm.group(1)] = mm.group(2)

print("CHUNK COUNT:", len(chunkmap))
# known entry files
entries = ["app", "chunk-libs", "runtime"]
# also list a few chunks for keywords
for name in sorted(chunkmap.keys()):
    print("CHUNK", name, chunkmap[name])
