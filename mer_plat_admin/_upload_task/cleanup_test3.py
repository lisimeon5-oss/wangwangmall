import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

# move test product to recycle bin
r = s.post(BASE + "/admin/merchant/product/delete", json={"id": 3956, "type": "recycle"}, timeout=30, verify=False)
print("recycle ->", r.status_code, r.text[:300])

# permanently delete from recycle bin
r = s.post(BASE + "/admin/merchant/product/delete", json={"id": 3956, "type": "delete"}, timeout=30, verify=False)
print("delete ->", r.status_code, r.text[:300])

# verify gone
r = s.get(BASE + "/admin/merchant/product/list", params={"page": 1, "limit": 10, "type": 2}, timeout=30, verify=False)
try:
    lst = r.json().get("data", {}).get("list", [])
    print("type=2 remaining:", [(p.get("id"), p.get("name")) for p in lst])
except Exception as e:
    print("list err", e, r.text[:200])
