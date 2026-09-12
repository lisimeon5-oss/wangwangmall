import requests, json, os

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
OUT = os.path.dirname(os.path.abspath(__file__))
s = requests.Session()
s.headers.update(H)

# Download an existing product image (from probe output)
img_url = "https://yt.pic.sheep2.shop/crmebimage/public/product/2026/09/10/a31f262576384becb0a9d2a1fd6049d3c6i4t50cwg.jpg"
r = s.get(img_url, timeout=30, verify=False)
print("download status", r.status_code, "bytes", len(r.content), r.headers.get("Content-Type"))

# Save to temp file
tmp = os.path.join(OUT, "_tmp_test_img.jpg")
with open(tmp, "wb") as f:
    f.write(r.content)

# Upload via multipart
with open(tmp, "rb") as f:
    files = {"multipart": ("test.jpg", f, r.headers.get("Content-Type", "image/jpeg"))}
    resp = s.post(BASE + "/admin/merchant/upload/image", params={"model": "product", "pid": 0}, files=files, timeout=60, verify=False)

print("upload status", resp.status_code)
print("upload text", resp.text[:2000])
try:
    print("upload json", json.dumps(resp.json(), ensure_ascii=False, indent=2)[:2000])
except Exception as e:
    print("not json", e)
