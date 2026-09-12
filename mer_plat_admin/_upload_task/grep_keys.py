import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(OUT, "js")

keys = ["storeName", "sliderImage", "attrValue", "skuList", "specType", "storeInfo", "cateId", "unitName", "description", "videoLink", "merUseId", "isSub"]

for fn in sorted(os.listdir(JS)):
    if not fn.endswith(".js"):
        continue
    p = os.path.join(JS, fn)
    t = open(p, encoding="utf-8", errors="ignore").read()
    hits = {}
    for k in keys:
        c = t.count(k)
        if c:
            hits[k] = c
    if hits:
        print(fn, hits)
