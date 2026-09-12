import re, os
OUT = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(OUT, "js", "app.98cc6f83.js"), encoding="utf-8", errors="ignore").read()
paths = sorted(set(re.findall(r'["\x60\'](/[a-zA-Z0-9/_\-\{\}:\.]+)["\x60\']', t)))
open(os.path.join(OUT, "all_paths.txt"), "w", encoding="utf-8").write("\n".join(paths))
print(len(paths), "paths written")
# print any containing captcha/code/key/img/login/verif
for p in paths:
    if re.search(r'captcha|code|key|img|login|verif|kaptcha', p, re.I):
        print(p)
