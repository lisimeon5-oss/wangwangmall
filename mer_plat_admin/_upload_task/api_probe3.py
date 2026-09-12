import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

def show(label, resp):
    try:
        j = resp.json()
    except Exception:
        j = resp.text[:500]
    print(f"\n===== {label} ({resp.status_code}) =====")
    print(json.dumps(j, ensure_ascii=False, indent=2)[:8000])

show("product/info/3938 (single)", s.get(BASE + "/admin/merchant/product/info/3938", timeout=30, verify=False))
show("product/info/3925 (multi)", s.get(BASE + "/admin/merchant/product/info/3925", timeout=30, verify=False))
