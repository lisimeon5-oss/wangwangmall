import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()

for needle in ["验证码", "图形验证码", "请输入验证码", "captch", "Captch", "getCode", "codeImg", "kaptcha", "validCode", "captchaKey", "getKey"]:
    idxs = [m.start() for m in re.finditer(re.escape(needle), t)]
    print("### %s -> %d" % (needle, len(idxs)))
    for j in idxs[:6]:
        s = max(0, j-180); e = min(len(t), j+280)
        print("...", t[s:e], "...")
        print("---")
