import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

# all http(s) urls
urls = sorted(set(re.findall(r'https?://[a-zA-Z0-9\.\-_/:]+', t)))
print("URLS:")
for u in urls:
    print(" ", u)

print("\nbaseURL context:")
for m in re.finditer(r'baseURL', t):
    s = max(0, m.start()-120)
    e = min(len(t), m.end()+200)
    print("...", t[s:e], "...")
    print("---")
