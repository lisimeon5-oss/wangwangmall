import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

# find all string literals that look like API paths
paths = sorted(set(re.findall(r'["\x60\'](/[a-zA-Z0-9/_\-\{\}:\.]+)["\x60\']', t)))
lines = []
for p in paths:
    if any(k in p for k in ("/admin/", "login", "product", "upload", "category", "attr", "merchant", "sku", "save", "create", "image")):
        lines.append(p)
open(os.path.join(OUT, "api_paths.txt"), "w", encoding="utf-8").write("\n".join(lines))
print("\n".join(lines))
