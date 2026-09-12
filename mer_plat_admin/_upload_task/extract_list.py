import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
t = open(os.path.join(d, "chunk-44d0629a.da1bc1da.js"), encoding="utf-8", errors="ignore").read()

out = []
for needle in ["handleDelete", "multipleSelection", "batch/recycle", "productDelete", "删除", "回收站", "type:", "delProduct", "recycle", "idList", "ids"]:
    out.append("=" * 80)
    out.append("context for %s" % needle)
    for m in list(re.finditer(re.escape(needle), t))[:3]:
        s = max(0, m.start() - 250)
        e = min(len(t), m.end() + 350)
        out.append(t[s:e])
        out.append("-" * 40)

open(os.path.join(d, "_list_ctx.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("done", len(out))
