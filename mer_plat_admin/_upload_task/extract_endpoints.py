import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
t = open(os.path.join(d, "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

print("=== product save / create / upload endpoints in app.js ===")
for pat in [r'"/admin/merchant/product/[^"]*"', r'"/admin/merchant/upload/[^"]*"', r'"/admin/[^"]*upload[^"]*"']:
    for m in sorted(set(re.findall(pat, t))):
        print(m)
