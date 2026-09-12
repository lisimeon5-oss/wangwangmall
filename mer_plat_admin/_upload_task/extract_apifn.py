import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
t = open(os.path.join(d, "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

for needle in ['"/admin/merchant/product/save"', '"/admin/merchant/upload/image"', '"/admin/merchant/upload/file"', '"/admin/merchant/product/info/"']:
    print("=" * 80)
    print("CONTEXT for", needle)
    for m in re.finditer(re.escape(needle), t):
        s = max(0, m.start() - 200)
        e = min(len(t), m.end() + 120)
        print(t[s:e])
        print("-" * 60)
