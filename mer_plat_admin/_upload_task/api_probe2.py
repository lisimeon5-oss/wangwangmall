import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {
    "User-Agent": "Mozilla/5.0",
    "Authori-zation": TOKEN,
}
s = requests.Session()
s.headers.update(H)

def show(label, resp):
    try:
        j = resp.json()
    except Exception:
        j = resp.text[:500]
    print(f"\n===== {label} ({resp.status_code}) =====")
    print(json.dumps(j, ensure_ascii=False)[:3000])

show("product/tabs/headers", s.get(BASE + "/admin/merchant/product/tabs/headers", timeout=30, verify=False))

for t in [0, 1, 2, 3]:
    show(f"product/list type={t}", s.get(BASE + "/admin/merchant/product/list", params={"page": 1, "limit": 3, "type": t}, timeout=30, verify=False))
