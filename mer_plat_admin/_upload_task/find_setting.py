import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

for needle in ["apiBaseURL", "VUE_APP", "location.origin", "\"/api/\"", "'/api/'", "httpUrl", "sheep2", "mer.", ".shop", "img."]:
    idxs = [m.start() for m in re.finditer(re.escape(needle), t)]
    print("### %s -> %d hits" % (needle, len(idxs)))
    for i in idxs[:8]:
        s = max(0, i-160); e = min(len(t), i+220)
        print("...", t[s:e], "...")
        print("---")
