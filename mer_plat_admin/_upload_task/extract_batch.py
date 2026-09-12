import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
app = open(os.path.join(d, "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

out = []
for needle in ['batch/recycle', 'batch/delete', 'batch/restore', 'batch/down', 'batch/up']:
    out.append("=" * 80)
    out.append("context for %s" % needle)
    for m in list(re.finditer(re.escape(needle), app))[:3]:
        s = max(0, m.start() - 350)
        e = min(len(app), m.end() + 200)
        out.append(app[s:e])
        out.append("-" * 40)

open(os.path.join(d, "_batch_ctx.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("done", len(out))
