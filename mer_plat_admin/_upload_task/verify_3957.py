import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

r = s.get(BASE + "/admin/merchant/product/info/3957", timeout=30, verify=False)
j = r.json()
d = j.get("data") or {}
print(json.dumps({
    "id": d.get("id"),
    "name": d.get("name"),
    "specType": d.get("specType"),
    "price": d.get("price"),
    "stock": d.get("stock"),
    "unitName": d.get("unitName"),
    "cateId": d.get("cateId"),
    "categoryId": d.get("categoryId"),
    "tempId": d.get("tempId"),
    "deliveryMethod": d.get("deliveryMethod"),
    "isShow": d.get("isShow"),
    "image": d.get("image"),
    "attrList": d.get("attrList"),
    "attrValueList": d.get("attrValueList"),
}, ensure_ascii=False, indent=2))
