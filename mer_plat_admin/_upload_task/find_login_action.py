import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

# full login store action
i = t.find("login:function(e,t){")
print("LOGIN ACTION:")
print(t[i:i+1800])
print("\n\n====================\n")

# search for captcha image endpoint patterns
for needle in ["/captcha", "captchaImage", "getCaptcha", "imgCaptcha", "code\":", "key\":"]:
    idxs = [m.start() for m in re.finditer(re.escape(needle), t)]
    print("### %s -> %d" % (needle, len(idxs)))
    for j in idxs[:6]:
        s = max(0, j-150); e = min(len(t), j+250)
        print("...", t[s:e], "...")
        print("---")
