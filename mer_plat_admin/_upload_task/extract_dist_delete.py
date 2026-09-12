import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist", "static", "js")
d = os.path.normpath(d)
files = [f for f in os.listdir(d) if f.endswith(".js")]
out = []
for f in files:
    t = open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()
    if "product/delete" in t or "productDelete" in t:
        out.append("===== FILE %s =====" % f)
        for needle in ["product/delete", "productDelete"]:
            for m in list(re.finditer(re.escape(needle), t))[:3]:
                s = max(0, m.start() - 400)
                e = min(len(t), m.end() + 400)
                out.append("--- %s ---" % needle)
                out.append(t[s:e])

open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "js", "_dist_delete_ctx.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("done", len(out))
