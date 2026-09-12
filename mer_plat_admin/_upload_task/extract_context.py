import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

def ctx(needle, before=200, after=400):
    out = []
    for m in re.finditer(re.escape(needle), t):
        s = max(0, m.start()-before)
        e = min(len(t), m.end()+after)
        out.append(t[s:e])
    return out

res = {}
for needle in ["merchant/login\"", "product/save", "upload/image", "getLoginPic", "account/detection"]:
    res[needle] = ctx(needle)

open(os.path.join(OUT, "contexts.txt"), "w", encoding="utf-8").write(
    "\n\n=====================\n\n".join("### %s\n\n%s" % (k, "\n\n---\n\n".join(v)) for k, v in res.items())
)
print("written", {k: len(v) for k, v in res.items()})
