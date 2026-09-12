import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

for ep, body in [
    ("/admin/merchant/product/batch/recycle", {"ids": [3956]}),
    ("/admin/merchant/product/batch/recycle", {"ids": "3956"}),
    ("/admin/merchant/product/batch/recycle", {"id": [3956]}),
    ("/admin/merchant/product/batch/delete", {"ids": [3956]}),
]:
    r = s.post(BASE + ep, json=body, timeout=30, verify=False)
    print(ep, body, "->", r.status_code, r.text[:300])
