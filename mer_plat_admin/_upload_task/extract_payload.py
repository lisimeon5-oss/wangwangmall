import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
files = ["chunk-4a5f46a6.c92ebc7b.js", "chunk-10b7da86.8ba9349f.js", "chunk-4d09e22a.81ad03e7.js"]
t = ""
for f in files:
    t += "\n/* ===== FILE: %s ===== */\n" % f + open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()

for needle in ['attrValueList', 'sliderImage', 'deliveryMethod', 'tempId', 'specType', 'getFromData', 'attrValue', 'attrList', 'unitName', 'guaranteeIds', 'formValidate', 'keyword']:
    print("=" * 80)
    print("CONTEXT for", needle)
    hits = [m.start() for m in re.finditer(re.escape(needle), t)]
    print("  hits:", len(hits))
    for m in hits[:8]:
        s = max(0, m - 120)
        e = min(len(t), m + 220)
        print(t[s:e])
        print("-" * 50)
