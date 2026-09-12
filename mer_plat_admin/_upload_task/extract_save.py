import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
t = ""
for f in ["chunk-4a5f46a6.c92ebc7b.js", "chunk-10b7da86.8ba9349f.js", "chunk-4d09e22a.81ad03e7.js"]:
    t += open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()

print("=== url strings containing 'product' ===")
for m in sorted(set(re.findall(r'url:"[^"]*product[^"]*"', t))):
    print(m)

print("=== strings containing 'save' and 'product' ===")
for m in sorted(set(re.findall(r'"[^"]*product[^"]*save[^"]*"', t))):
    print(m)

print("=== strings containing 'upload' ===")
for m in sorted(set(re.findall(r'"[^"]*upload[^"]*"', t))):
    print(m)

print("=== strings containing 'image' path ===")
for m in sorted(set(re.findall(r'"[^"]*image[^"]*"', t))):
    if len(m) < 120:
        print(m)
