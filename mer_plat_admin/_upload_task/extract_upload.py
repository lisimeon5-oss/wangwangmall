import re, os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js")
t = ""
for f in ["chunk-4a5f46a6.c92ebc7b.js", "chunk-10b7da86.8ba9349f.js", "chunk-4d09e22a.81ad03e7.js"]:
    t += open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()

out = []
for needle in ["new FormData", "multipart", "uploadPic", "images_upload_handler", "pid:", "model:", "upload/image"]:
    out.append("=" * 80)
    out.append("context for %s" % needle)
    for m in list(re.finditer(re.escape(needle), t))[:4]:
        s = max(0, m.start() - 300)
        e = min(len(t), m.end() + 400)
        out.append(t[s:e])
        out.append("-" * 40)

open(os.path.join(d, "_upload_ctx.txt"), "w", encoding="utf-8", errors="replace").write("\n".join(out))
print("done", len(out))
