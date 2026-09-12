import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()
for needle in ["md5", "Md5", "MD5", "encrypt", "Encrypt", "password", "pwd", "aesEncrypt", "CryptoJS", "sha", "SHA"]:
    idxs = [m.start() for m in re.finditer(re.escape(needle), t)]
    print("### %s -> %d" % (needle, len(idxs)))
    for j in idxs[:4]:
        s = max(0, j-120); e = min(len(t), j+180)
        print("...", t[s:e], "...")
        print("---")
