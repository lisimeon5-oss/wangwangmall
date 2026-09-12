import requests, json, base64, os

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
OUT = os.path.dirname(os.path.abspath(__file__))

s = requests.Session()
s.headers.update(UA)

r = s.post(BASE + "/publicly/safety/get", json={"captchaType": "blockPuzzle", "clientUid": "", "ts": 1700000000000}, timeout=30, verify=False)
j = r.json()
d = j["data"]["repData"]
print("repData keys:", list(d.keys()))
for k, v in d.items():
    if isinstance(v, str) and len(v) > 60:
        print(k, "= (str len %d) %s..." % (len(v), v[:50]))
    else:
        print(k, "=", v)

# save images
for key in ("originalImageBase64", "jigsawImageBase64"):
    if d.get(key):
        img = base64.b64decode(d[key])
        ext = "png"
        p = os.path.join(OUT, key + "." + ext)
        open(p, "wb").write(img)
        print("saved", p, len(img), "bytes")

# save token/secretKey
open(os.path.join(OUT, "captcha_info.json"), "w").write(json.dumps({
    "token": d.get("token"),
    "secretKey": d.get("secretKey"),
    "captchaType": d.get("captchaType"),
}))
print("token:", d.get("token"))
print("secretKey:", d.get("secretKey"))
