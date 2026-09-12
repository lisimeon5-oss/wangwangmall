import re, os, sys, io
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
files = ["chunk-4a5f46a6.c92ebc7b.js", "chunk-10b7da86.8ba9349f.js", "chunk-4d09e22a.81ad03e7.js"]
t = ""
for f in files:
    t += "\n/* ===== FILE: %s ===== */\n" % f + open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()

out = []
for needle in ['labelarr', 'JSON.stringify', 'deliveryMethodList.join', 'cateIds.join', 'attrValue:', 'ManyAttrValue', 'OneattrValue', 'OneAttrValue', 'generateAttr', 'productSave', 'save(', '.save', 'attrValueList', 'attrList', 'sku:', 'specType']:
    out.append("=" * 90)
    out.append("CONTEXT for %s" % needle)
    hits = [m.start() for m in re.finditer(re.escape(needle), t)]
    out.append("  hits: %d" % len(hits))
    for m in hits[:4]:
        s = max(0, m - 120)
        e = min(len(t), m + 260)
        out.append(t[s:e])
        out.append("-" * 50)

open(os.path.join(d, "_payload_ctx.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("written", len(out), "lines")
