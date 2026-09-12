import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}

s = requests.Session()
s.headers.update(UA)

payloads = [
    ("no captcha", {"account": "13555555555", "pwd": "zhangjianmei66"}),
    ("key/code", {"account": "13555555555", "pwd": "zhangjianmei66", "key": "abc", "code": "1234"}),
    ("captchaVerification flat", {"account": "13555555555", "pwd": "zhangjianmei66", "captchaVerification": "x", "secretKey": "y", "token": "z"}),
    ("captchaVO nested", {"account": "13555555555", "pwd": "zhangjianmei66", "captchaVO": {"captchaVerification": "x", "secretKey": "y", "token": "z"}}),
]

for tag, payload in payloads:
    r = s.post(BASE + "/admin/merchant/login", json=payload, timeout=30, verify=False)
    try:
        j = r.json()
    except Exception:
        j = r.text
    print("=== %s ===" % tag)
    print(json.dumps(j, ensure_ascii=False)[:800])
    print()

# also probe the captcha GET endpoint (POST method per local code)
r = s.post(BASE + "/publicly/safety/get", json={"captchaType": "blockPuzzle", "clientUid": "", "ts": 1700000000000}, timeout=30, verify=False)
print("=== publicly/safety/get (POST) ===")
print(r.status_code, json.dumps(r.json(), ensure_ascii=False)[:800])
