import requests, json, base64, os, cv2, numpy as np
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
OUT = os.path.dirname(os.path.abspath(__file__))

def aes_encrypt(word, key):
    key_b = key.encode("utf-8")[:16]
    cipher = AES.new(key_b, AES.MODE_ECB)
    ct = cipher.encrypt(pad(word.encode("utf-8"), 16))
    return base64.b64encode(ct).decode()

s = requests.Session()
s.headers.update(UA)

# 1. get captcha
r = s.post(BASE + "/publicly/safety/get", json={"captchaType": "blockPuzzle", "clientUid": "", "ts": 1700000000000}, timeout=30, verify=False)
d = r.json()["data"]["repData"]
token = d["token"]
secretKey = d["secretKey"]
bg_bytes = base64.b64decode(d["originalImageBase64"])
pc_bytes = base64.b64decode(d["jigsawImageBase64"])
bg = cv2.imdecode(np.frombuffer(bg_bytes, np.uint8), cv2.IMREAD_COLOR)
pc = cv2.imdecode(np.frombuffer(pc_bytes, np.uint8), cv2.IMREAD_UNCHANGED)
print("bg", bg.shape, "piece", pc.shape)

mask = (pc[:, :, 3] > 0).astype(np.uint8) * 255
res = cv2.matchTemplate(bg, pc[:, :, :3], cv2.TM_CCOEFF_NORMED, mask=mask)
minv, maxv, minloc, maxloc = cv2.minMaxLoc(res)
x = maxloc[0]
print("x =", x, "score", maxv)

# 2. check
pointJson = aes_encrypt(json.dumps({"x": x, "y": 5.0}), secretKey)
r = s.post(BASE + "/publicly/safety/check", json={"captchaType": "blockPuzzle", "pointJson": pointJson, "token": token}, timeout=30, verify=False)
print("check:", json.dumps(r.json(), ensure_ascii=False)[:500])
