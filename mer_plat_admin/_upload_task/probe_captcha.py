import requests, json

requests.packages.urllib3.disable_warnings()
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
HOST = "https://yt.mer.sheep2.shop"

candidates = [
    "/admin/api/captcha/get",
    "/admin/api/captcha",
    "/admin/api/admin/captcha",
    "/admin/api/admin/merchant/captcha",
    "/admin/api/getCaptcha",
    "/admin/api/admin/merchant/getCaptcha",
    "/captcha/get",
    "/captcha",
]

s = requests.Session()
s.headers.update(UA)
for path in candidates:
    try:
        r = s.get(HOST + path, timeout=15, verify=False)
        ct = r.headers.get("Content-Type", "")
        print("=== %s -> %d %s len=%d" % (path, r.status_code, ct, len(r.content)))
        body = r.text[:300]
        print(body.replace("\n", " ")[:300])
    except Exception as e:
        print("=== %s -> ERR %s" % (path, e))
    print()
