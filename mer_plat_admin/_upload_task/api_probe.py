import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Authori-zation": TOKEN,
}
s = requests.Session()
s.headers.update(H)

def show(label, resp):
    try:
        j = resp.json()
    except Exception:
        j = resp.text[:300]
    print(f"\n===== {label} ({resp.status_code}) =====")
    print(json.dumps(j, ensure_ascii=False)[:1500])

# verify auth
show("getAdminInfoByToken", s.get(BASE + "/admin/merchant/getAdminInfoByToken", timeout=30, verify=False))

# category tree (store product category)
show("store/product/category/cache/tree", s.get(BASE + "/admin/merchant/store/product/category/cache/tree", timeout=30, verify=False))

# platform product category tree
show("plat/product/category/cache/tree", s.get(BASE + "/admin/merchant/plat/product/category/cache/tree", timeout=30, verify=False))

# brand list
show("plat/product/brand/cache/list", s.get(BASE + "/admin/merchant/plat/product/brand/cache/list", params={"limit": 9999, "page": 1}, timeout=30, verify=False))

# guarantee list
show("plat/product/guarantee/list", s.get(BASE + "/admin/merchant/plat/product/guarantee/list", timeout=30, verify=False))

# shipping templates
show("shipping/templates/list", s.get(BASE + "/admin/merchant/shipping/templates/list", timeout=30, verify=False))

# product list (to see existing products / structure)
show("product/list", s.get(BASE + "/admin/merchant/product/list", params={"page": 1, "limit": 5}, timeout=30, verify=False))
