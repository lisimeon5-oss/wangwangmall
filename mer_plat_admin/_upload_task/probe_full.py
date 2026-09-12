import requests, json, os

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
OUT = os.path.dirname(os.path.abspath(__file__))
s = requests.Session()
s.headers.update(H)

def save(label, resp):
    try:
        j = resp.json()
    except Exception:
        j = {"_raw": resp.text[:500]}
    fn = os.path.join(OUT, "probe_" + label.replace("/", "_") + ".json")
    with open(fn, "w", encoding="utf-8") as f:
        json.dump(j, f, ensure_ascii=False, indent=2)
    print(f"{label}: HTTP {resp.status_code}, saved {fn}")

save("auth", s.get(BASE + "/admin/merchant/getAdminInfoByToken", timeout=30, verify=False))
save("product_info_3938_single", s.get(BASE + "/admin/merchant/product/info/3938", timeout=30, verify=False))
save("product_info_3925_multi", s.get(BASE + "/admin/merchant/product/info/3925", timeout=30, verify=False))
save("category_store_tree", s.get(BASE + "/admin/merchant/store/product/category/cache/tree", timeout=30, verify=False))
save("category_plat_tree", s.get(BASE + "/admin/merchant/plat/product/category/cache/tree", timeout=30, verify=False))
save("brand_list", s.get(BASE + "/admin/merchant/plat/product/brand/cache/list", params={"limit": 9999, "page": 1}, timeout=30, verify=False))
save("guarantee_list", s.get(BASE + "/admin/merchant/plat/product/guarantee/list", timeout=30, verify=False))
save("shipping_templates", s.get(BASE + "/admin/merchant/shipping/templates/list", timeout=30, verify=False))
