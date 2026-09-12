import requests, json, os

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
OUT = os.path.dirname(os.path.abspath(__file__))

s = requests.Session()
s.headers.update(UA)

def show(tag, r):
    print("=== %s ===" % tag)
    print("status", r.status_code)
    print("url", r.url)
    try:
        print("json", json.dumps(r.json(), ensure_ascii=False)[:2000])
    except Exception:
        print("text", r.text[:1500])
    print()

r = s.get(BASE + "/admin/merchant/getLoginPic", timeout=30, verify=False)
show("getLoginPic", r)

r = s.post(BASE + "/admin/merchant/login/account/detection", json={"account": "13555555555"}, timeout=30, verify=False)
show("account/detection", r)

payload = {"account": "13555555555", "pwd": "zhangjianmei66", "captchaVO": {}}
r = s.post(BASE + "/admin/merchant/login", json=payload, timeout=30, verify=False)
show("login", r)
