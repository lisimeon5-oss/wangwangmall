import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(OUT, "home2.html"), encoding="utf-8").read()
print("len", len(html))
i = html.find("function f")
print("f idx", i)
if i >= 0:
    print(repr(html[i:i+400]))
# extract the map after '."+' 
m = re.search(r'\+\.\s*(\{"chunk-[^}]*\})\[c\]', html)
print("map found", bool(m))
if m:
    s = m.group(1)
    pairs = re.findall(r'"([\w-]+)":"([\w]+)"', s)
    print("count", len(pairs))
    for k, v in pairs[:10]:
        print(k, v)
