import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

for t in [0, 1, 2, 3]:
    r = s.get(BASE + "/admin/merchant/product/list", params={"page": 1, "limit": 10, "type": t}, timeout=30, verify=False)
    try:
        j = r.json()
        lst = j.get("data", {}).get("list", [])
        print(f"type={t}: code={j.get('code')} count={len(lst)}")
        for p in lst:
            name = p.get("name") or p.get("storeName")
            if "TEST_DELETE" in str(name) or "BIg" in str(name) or "BIg" in str(p.get("storeInfo", {}).get("storeName", "")):
                print("  FOUND:", p.get("id"), name, p.get("stock"), p.get("price"))
    except Exception as e:
        print("type", t, "err", e, r.text[:200])
