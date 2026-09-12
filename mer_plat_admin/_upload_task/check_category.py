import requests, json

requests.packages.urllib3.disable_warnings()

PLAT_BASE = "https://yt.admin.sheep2.shop/admin/api"
MER_BASE = "https://yt.mer.sheep2.shop/admin/api"
UA = {"User-Agent": "Mozilla/5.0"}

plat = requests.Session(); plat.headers.update(UA)
mer = requests.Session(); mer.headers.update(UA)
mer.headers["Authori-zation"] = "merchant6c40b2ca23864e0282da5d9aea75fdf5"

r = plat.post(PLAT_BASE + "/admin/platform/login", json={"account":"admin","pwd":"zhangjianmei66","captchaVO":{}}, timeout=30, verify=False)
plat.headers["Authori-zation"] = r.json()["data"]["token"]

print("===== PLATFORM product info 3957 =====")
r = plat.get(PLAT_BASE + "/admin/platform/product/info/3957", timeout=30, verify=False)
print(json.dumps(r.json(), ensure_ascii=False, indent=2))

print("\n===== MERCHANT product info 3957 =====")
r = mer.get(MER_BASE + "/admin/merchant/product/info/3957", timeout=30, verify=False)
print(json.dumps(r.json(), ensure_ascii=False, indent=2))
