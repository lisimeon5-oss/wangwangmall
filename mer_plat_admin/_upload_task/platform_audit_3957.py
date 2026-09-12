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
    print("===== %s (%s) =====" % (label, r.status_code))
    print(json.dumps(j, ensure_ascii=False, indent=2)[:2500])

# 1. login
payload = {"account": "admin", "pwd": "zhangjianmei66", "captchaVO": {}}
r = s.post(BASE + "/admin/platform/login", json=payload, timeout=30, verify=False)
lj = r.json()
token = (lj.get("data") or {}).get("token")
if not token:
    print("LOGIN FAILED:", json.dumps(lj, ensure_ascii=False))
    sys.exit(1)
s.headers["Authori-zation"] = token
print("logged in, token:", token)

# 2. audit approve product 3957
audit_body = {"id": 3957, "auditStatus": "success", "reason": ""}
r = s.post(BASE + "/admin/platform/product/audit", json=audit_body, timeout=30, verify=False)
show("product/audit", r)

# 3. re-check product info
r = s.get(BASE + "/admin/platform/product/info/3957", timeout=30, verify=False)
j = r.json()
d = j.get("data") or {}
print("\nAFTER AUDIT -> id=%s name=%s auditStatus=%s isShow=%s price=%s stock=%s" % (
    d.get("id"), d.get("name"), d.get("auditStatus"), d.get("isShow"), d.get("price"), d.get("stock")))
