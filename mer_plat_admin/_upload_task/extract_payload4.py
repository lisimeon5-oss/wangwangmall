import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
t = ""
for f in ["chunk-4a5f46a6.c92ebc7b.js", "chunk-10b7da86.8ba9349f.js", "chunk-4d09e22a.81ad03e7.js"]:
    t += open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()

out = []
# Full getFromData / save builder window
for needle in ['attrValueList:this.formValidate.specType', 'cateId:this.formValidate.cateIds.join', 'onChangeSpec', 'JSON.stringify({"规格"', 'sku:', 'attrValue:', 'generateAttr']:
    out.append("=" * 90)
    out.append("WINDOW for %s" % needle)
    for m in re.finditer(re.escape(needle), t):
        s = max(0, m.start() - 600)
        e = min(len(t), m.end() + 600)
        out.append(t[s:e])
        out.append("-" * 50)

open(os.path.join(d, "_payload_ctx2.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("done", len(out))
