import requests, json, sys

requests.packages.urllib3.disable_warnings()

BASE = "https://yt.admin.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
s = requests.Session()
s.headers.update(UA)

def show(label, r):
    try:
        j = r.json()
    except Exception:
        j = {"_raw": r.text[:500]}
    print("\n===== %s (%s) =====" % (label, r.status_code))
    print(json.dumps(j, ensure_ascii=False, indent=2)[:3000])

# 1. account detection (check errorsNumber -> captcha needed?)
r = s.post(BASE + "/admin/platform/login/account/detection", json={"account": "admin"}, timeout=30, verify=False)
show("account/detection", r)
d = r.json()
errors_number = (d.get("data") or {}) if isinstance(d.get("data"), dict) else d.get("data")
print("errorsNumber:", errors_number)

# 2. login
payload = {"account": "admin", "pwd": "zhangjianmei66", "captchaVO": {}}
r = s.post(BASE + "/admin/platform/login", json=payload, timeout=30, verify=False)
show("login", r)
lj = r.json()
token = (lj.get("data") or {}).get("token")
print("TOKEN:", token)
if not token:
    print("LOGIN FAILED, aborting")
    sys.exit(1)

s.headers["Authori-zation"] = token

# 3. verify token
r = s.get(BASE + "/admin/platform/getAdminInfoByToken", timeout=30, verify=False)
show("getAdminInfoByToken", r)

# 4. product info for id 3957 (platform product id may differ)
r = s.get(BASE + "/admin/platform/product/info/3957", timeout=30, verify=False)
show("product/info/3957", r)

# 5. search product by keywords across tabs (type int)
for t in [6, 2, 1, 7]:
    r = s.get(BASE + "/admin/platform/product/list", params={"page": 1, "limit": 20, "keywords": "BIg", "type": t}, timeout=30, verify=False)
    show("product/list type=%s keywords=BIg" % t, r)
    data = r.json().get("data") or {}
    lst = data.get("list") or []
    print("COUNT:", len(lst), "total:", data.get("total"))
    for p in lst:
        print("  id=%s name=%s merId=%s auditStatus=%s isShow=%s price=%s stock=%s" % (
            p.get("id"), p.get("name"), p.get("merId"), p.get("auditStatus"), p.get("isShow"), p.get("price"), p.get("stock")))
