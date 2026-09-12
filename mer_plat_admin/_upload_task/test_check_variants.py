import requests, json, base64, os
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

s = requests.Session()
s.headers.update(UA)

def get_captcha():
    r = s.post(BASE + "/publicly/safety/get", json={"captchaType": "blockPuzzle", "clientUid": "", "ts": 1700000000000}, timeout=30, verify=False)
    d = r.json()["data"]["repData"]
    return d["token"], d["secretKey"]

for tag, mk in [
    ("raw json pointJson, type blockPuzzle", lambda tok, sk, x: {"captchaType": "blockPuzzle", "pointJson": json.dumps({"x": x, "y": 5.0}), "token": tok}),
    ("encrypted pointJson, type blockPuzzle", lambda tok, sk, x: {"captchaType": "blockPuzzle", "pointJson": aes_encrypt(json.dumps({"x": x, "y": 5.0}), sk), "token": tok}),
    ("encrypted, no captchaType", lambda tok, sk, x: {"pointJson": aes_encrypt(json.dumps({"x": x, "y": 5.0}), sk), "token": tok}),
    ("encrypted, type clickWord", lambda tok, sk, x: {"captchaType": "clickWord", "pointJson": aes_encrypt(json.dumps({"x": x, "y": 5.0}), sk), "token": tok}),
]:
    tok, sk = get_captcha()
    payload = mk(tok, sk, 120)
    r = s.post(BASE + "/publicly/safety/check", json=payload, timeout=30, verify=False)
    print("=== %s ===" % tag)
    print(json.dumps(r.json(), ensure_ascii=False)[:400])
    print()
