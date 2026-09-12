import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
app = open(os.path.join(d, "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

out = []
for needle in ['"/admin/merchant/product/delete"', '"/admin/merchant/product/recycle"', 'product/delete', 'function c(e){return Object(r["a"])({url:"/admin/merchant/product/delete']:
    out.append("=" * 80)
    out.append("context for %s" % needle)
    for m in list(re.finditer(re.escape(needle), app))[:4]:
        s = max(0, m.start() - 300)
        e = min(len(app), m.end() + 300)
        out.append(app[s:e])
        out.append("-" * 40)

open(os.path.join(d, "_delete_ctx.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("done", len(out))
