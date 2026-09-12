import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

def ctx(needle, before=300, after=600, maxn=20):
    out = []
    for m in re.finditer(re.escape(needle), t):
        s = max(0, m.start()-before)
        e = min(len(t), m.end()+after)
        out.append(t[s:e])
        if len(out) >= maxn:
            break
    return out

res = []
for needle in ["storeName", "cateId", "sliderImage", "attrValue", "skuList", "specType", "otPrice", "barCode", "unitName"]:
    c = ctx(needle)
    res.append("### %s (count=%d)\n\n%s" % (needle, t.count(needle), "\n\n---\n\n".join(c)))

open(os.path.join(OUT, "product_ctx.txt"), "w", encoding="utf-8").write("\n\n=====================\n\n".join(res))
print("done")
