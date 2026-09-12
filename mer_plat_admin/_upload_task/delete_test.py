import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

# delete the test product
for pid in [3956]:
    r = s.post(BASE + "/admin/merchant/product/delete", json={"id": pid}, timeout=30, verify=False)
    print("delete", pid, r.status_code, r.text[:500])

# verify tabs headers to understand types
r = s.get(BASE + "/admin/merchant/product/tabs/headers", timeout=30, verify=False)
print("tabs:", json.dumps(r.json(), ensure_ascii=False, indent=2)[:1500])
