import requests, json, sys

requests.packages.urllib3.disable_warnings()

MER_BASE = "https://yt.mer.sheep2.shop/admin/api"
PLAT_BASE = "https://yt.admin.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}

MER_TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"

mer = requests.Session()
mer.headers.update(UA)
mer.headers["Authori-zation"] = MER_TOKEN

plat = requests.Session()
plat.headers.update(UA)

def show(label, r):
    try:
        j = r.json()
    except Exception:
        j = {"_raw": r.text[:500]}
    print("===== %s (%s) =====" % (label, r.status_code))
    print(json.dumps(j, ensure_ascii=False, indent=2)[:1500])
    return j

def mer_info():
    r = mer.get(MER_BASE + "/admin/merchant/product/info/3957", timeout=30, verify=False)
    d = (r.json().get("data") or {})
    print("  [merchant] id=%s name=%s auditStatus=%s isShow=%s" % (d.get("id"), d.get("name"), d.get("auditStatus"), d.get("isShow")))
    return d

print("### current state")
mer_info()

# merchant list it (上架)
print("\n### merchant product up (上架)")
r = mer.post(MER_BASE + "/admin/merchant/product/up/3957", timeout=30, verify=False)
show("product/up/3957", r)
print("  after up:")
mer_info()

# platform verify
print("\n### platform login + verify")
r = plat.post(PLAT_BASE + "/admin/platform/login", json={"account": "admin", "pwd": "zhangjianmei66", "captchaVO": {}}, timeout=30, verify=False)
token = (r.json().get("data") or {}).get("token")
plat.headers["Authori-zation"] = token
r = plat.get(PLAT_BASE + "/admin/platform/product/info/3957", timeout=30, verify=False)
d = (r.json().get("data") or {})
print("  [platform] id=%s name=%s auditStatus=%s isShow=%s" % (d.get("id"), d.get("name"), d.get("auditStatus"), d.get("isShow")))

