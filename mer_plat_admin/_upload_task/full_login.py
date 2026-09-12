import requests, json, base64, os, cv2, numpy as np
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}

def aes_encrypt(word, key):
    key_b = key.encode("utf-8")[:16]
    cipher = AES.new(key_b, AES.MODE_ECB)
    ct = cipher.encrypt(pad(word.encode("utf-8"), 16))
    return base64.b64encode(ct).decode()

def js_dumps(obj):
    # emulate JSON.stringify (no spaces, compact)
    return json.dumps(obj, separators=(",", ":"))

s = requests.Session()
s.headers.update(UA)

# 1. get captcha
r = s.post(BASE + "/publicly/safety/get", json={"captchaType": "blockPuzzle", "clientUid": "", "ts": 1700000000000}, timeout=30, verify=False)
d = r.json()["data"]["repData"]
token = d["token"]
secretKey = d["secretKey"]
bg = cv2.imdecode(np.frombuffer(base64.b64decode(d["originalImageBase64"]), np.uint8), cv2.IMREAD_COLOR)
pc = cv2.imdecode(np.frombuffer(base64.b64decode(d["jigsawImageBase64"]), np.uint8), cv2.IMREAD_UNCHANGED)

# 2. solve
mask = (pc[:, :, 3] > 0).astype(np.uint8) * 255
res = cv2.matchTemplate(bg, pc[:, :, :3], cv2.TM_CCOEFF_NORMED, mask=mask)
minv, maxv, minloc, maxloc = cv2.minMaxLoc(res)
x = maxloc[0]
print("solved x =", x, "score", round(maxv, 4))

# 3. check
pointJson = aes_encrypt(js_dumps({"x": x, "y": 5}), secretKey)
r = s.post(BASE + "/publicly/safety/check", json={"captchaType": "blockPuzzle", "pointJson": pointJson, "token": token}, timeout=30, verify=False)
chk = r.json()
print("check:", json.dumps(chk, ensure_ascii=False)[:400])
if chk.get("data", {}).get("repCode") != "0000":
    print("CAPTCHA CHECK FAILED, aborting")
    raise SystemExit(1)

# 4. captchaVerification for login
captchaVerification = aes_encrypt(token + "---" + js_dumps({"x": x, "y": 5}), secretKey)
print("captchaVerification:", captchaVerification[:50], "...")

# 5. login
payload = {
    "account": "13555555555",
    "pwd": "000000",
    "captchaVO": {"captchaVerification": captchaVerification, "secretKey": secretKey, "token": token},
}
r = s.post(BASE + "/admin/merchant/login", json=payload, timeout=30, verify=False)
lj = r.json()
print("login:", json.dumps(lj, ensure_ascii=False)[:600])
