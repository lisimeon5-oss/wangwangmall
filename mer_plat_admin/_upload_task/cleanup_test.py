import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

for typ in [2, 1, 3, 4, 5, 0]:
    r = s.post(BASE + "/admin/merchant/product/delete", json={"id": 3956, "type": typ}, timeout=30, verify=False)
    print("delete type=%s -> %s %s" % (typ, r.status_code, r.text[:300]))
    try:
        if r.json().get("code") == 200:
            break
    except Exception:
        pass
