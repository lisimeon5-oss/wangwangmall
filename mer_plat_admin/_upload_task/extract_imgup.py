import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
t = ""
for f in ["chunk-4a5f46a6.c92ebc7b.js", "chunk-10b7da86.8ba9349f.js", "chunk-4d09e22a.81ad03e7.js"]:
    t += open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()
app = open(os.path.join(d, "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

out = []
for needle in ["shopImgUpload", "img/upload", "uploadType", "sattDir", "respType", "shop/img/upload"]:
    out.append("=" * 80)
    out.append("APP.JS context for %s" % needle)
    for m in list(re.finditer(re.escape(needle), app))[:3]:
        s = max(0, m.start() - 200)
        e = min(len(app), m.end() + 300)
        out.append(app[s:e])
        out.append("-" * 40)
    out.append("CHUNK context for %s" % needle)
    for m in list(re.finditer(re.escape(needle), t))[:3]:
        s = max(0, m.start() - 200)
        e = min(len(t), m.end() + 300)
        out.append(t[s:e])
        out.append("-" * 40)

open(os.path.join(d, "_imgup_ctx.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("done", len(out))
