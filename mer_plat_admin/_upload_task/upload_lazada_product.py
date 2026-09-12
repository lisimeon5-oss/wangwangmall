"""
CRMEB merchant product uploader
Target: https://yt.mer.sheep2.shop  (merchant: 两只羊百货, merId=5)

Reverse-engineered from the live merchant admin frontend:
  - image upload   POST /admin/merchant/upload/image?model=product&pid=0   (multipart field "multipart")
  - product create POST /admin/merchant/product/save                        (JSON body)
  - product info   GET  /admin/merchant/product/info/{id}
  - product list   GET  /admin/merchant/product/list?type=...
  - delete         POST /admin/merchant/product/delete  {id, type:"recycle"|"delete"}

Validated reference values (merchant 两只羊百货):
  - store category cateId="85", platform categoryId=566, brandId=0, guaranteeIds="",
    shipping template tempId=3 ("全国包邮"), deliveryMethod="1", unitName="件".
"""

import os
import json
import sys
import time
import mimetypes

import requests

requests.packages.urllib3.disable_warnings()

BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Authori-zation": TOKEN,
}

# ---------------------------------------------------------------------------
# CONFIG — edit the values below.
# ---------------------------------------------------------------------------
PRODUCT = {
    # The Lazada product title (do NOT include the variant here).
    "name": "BIg 30-35",
    # Short selling point / intro (one line).
    "intro": "Lazada 商品规格 BIg 30-35",
    # Comma-separated search keywords.
    "keyword": "lazada, BIg 30-35",

    # The variant to upload (the spec value).
    "variant": "BIg 30-35",
    # Price in THB, stock quantity.
    "price": "179.00",
    "stock": 1,

    # Main / cover image: either a remote URL or a local file path.
    "cover_image": "placeholder_big_30_35.jpg",
    # Gallery images (URLs or local paths). The cover is prepended automatically.
    # Up to 10 images total are allowed (cover + gallery).
    "gallery_images": [],

    # Full HTML description shown on the product detail page.
    "content_html": "<div style=\"padding:18px 16px;background:#fff;color:#333;font-size:15px;line-height:1.85;text-align:left;\"><p><strong>BIg 30-35</strong></p><p>规格：BIg 30-35</p><p>价格：179 THB</p><p>库存：1</p></div>",

    # Optional overrides (proven defaults for this merchant).
    "cate_id": "85",
    "category_id": 566,
    "brand_id": 0,
    "guarantee_ids": "",
    "temp_id": 3,
    "unit_name": "件",
    "is_show": False,  # False = stays in "待审核/仓库" draft; True = list on sale
}

def _log(msg):
    print("[uploader]", msg)


def _request(method, url, **kwargs):
    return requests.request(method, url, headers=HEADERS, timeout=90, verify=False, **kwargs)


def upload_image(path_or_url):
    """Upload one image (local path or URL) -> returns the CDN URL."""
    _log("uploading image: %s" % path_or_url)

    if isinstance(path_or_url, str) and path_or_url.startswith(("http://", "https://")):
        r = requests.get(path_or_url, timeout=90, verify=False)
        r.raise_for_status()
        data = r.content
        ct = r.headers.get("Content-Type", "image/jpeg")
        filename = os.path.basename(path_or_url.split("?")[0]) or "image.jpg"
    else:
        if not os.path.isabs(path_or_url):
            path_or_url = os.path.join(os.path.dirname(os.path.abspath(__file__)), path_or_url)
        with open(path_or_url, "rb") as f:
            data = f.read()
        ct = mimetypes.guess_type(path_or_url)[0] or "image/jpeg"
        filename = os.path.basename(path_or_url)

    files = {"multipart": (filename, data, ct)}
    resp = _request("POST", BASE + "/admin/merchant/upload/image",
                    params={"model": "product", "pid": 0}, files=files)
    try:
        j = resp.json()
    except Exception:
        raise RuntimeError("image upload failed: HTTP %s %s" % (resp.status_code, resp.text[:300]))

    if j.get("code") != 200 or not (j.get("data") or {}).get("url"):
        raise RuntimeError("image upload failed: %s" % json.dumps(j, ensure_ascii=False))

    return j["data"]["url"]

def build_payload(product, cover_url, gallery_urls):
    """Build the CRMEB product/save payload for a single-spec product."""
    variant = product["variant"]
    all_images = [cover_url] + [u for u in gallery_urls if u and u != cover_url]
    all_images = all_images[:10]

    payload = {
        "image": cover_url,
        "sliderImage": json.dumps(all_images, ensure_ascii=False),
        "name": product["name"],
        "intro": product["intro"],
        "keyword": product["keyword"],
        "cateId": product["cate_id"],
        "brandId": product["brand_id"],
        "categoryId": product["category_id"],
        "guaranteeIds": product["guarantee_ids"],
        "unitName": product["unit_name"],
        "sort": 1,
        "ficti": 0,
        "specType": False,  # single spec
        "attrList": [
            {
                "id": 0,
                "attributeName": "规格",
                "isShowImage": False,
                "sort": 0,
                "optionList": [{"id": 0, "optionName": variant, "image": "", "sort": 1}],
            }
        ],
        "attrValueList": [
            {
                "id": 0,
                "sku": variant,
                "stock": int(product["stock"]),
                "price": product["price"],
                "image": cover_url,
                "cost": "0.01",
                "otPrice": product["price"],
                "weight": "0.00",
                "volume": "0.00",
                "brokerage": 0,
                "brokerageTwo": 0,
                "type": 0,
                "quota": 0,
                "quotaShow": 0,
                "attrValue": json.dumps({"规格": variant}, ensure_ascii=False),
                "barCode": "",
                "expand": "",
                "cdkeyId": 0,
                "cdkeyLibraryName": None,
                "vipPrice": "0.00",
                "redeemIntegral": 0,
                "isShow": True,
                "isDefault": True,
                "itemNumber": "",
            }
        ],
        "content": product["content_html"],
        "couponIds": None,
        "flatPattern": "",
        "tempId": product["temp_id"],
        "isSub": False,
        "type": 0,
        "isPaidMember": False,
        "deliveryMethod": "1",
        "systemFormId": 0,
        "refundSwitch": True,
        "isShow": product["is_show"],
    }
    return payload


def save_product(payload):
    """POST /admin/merchant/product/save and return the JSON envelope."""
    resp = _request("POST", BASE + "/admin/merchant/product/save", json=payload)
    try:
        return resp.json()
    except Exception:
        return {"code": -1, "message": resp.text[:300]}

def main():
    product = PRODUCT

    # sanity checks
    missing = [k for k in ("name", "intro", "content_html") if "CHANGE_ME" in str(product.get(k, ""))]
    if "CHANGE_ME" in str(product.get("cover_image", "")):
        missing.append("cover_image")
    if missing:
        _log("ERROR: please fill in the CONFIG fields first: %s" % ", ".join(missing))
        sys.exit(2)

    # 1. verify token
    auth = _request("GET", BASE + "/admin/merchant/getAdminInfoByToken").json()
    if auth.get("code") != 200:
        _log("ERROR: token invalid -> %s" % json.dumps(auth, ensure_ascii=False))
        sys.exit(1)
    _log("authenticated as: %s (merId=%s)" % (
        (auth.get("data") or {}).get("realName"), (auth.get("data") or {}).get("merId")))

    # 2. upload images
    cover_url = upload_image(product["cover_image"])
    gallery_urls = [upload_image(u) for u in product["gallery_images"]]
    _log("cover: %s" % cover_url)
    for u in gallery_urls:
        _log("gallery: %s" % u)

    # 3. build & save
    payload = build_payload(product, cover_url, gallery_urls)
    _log("saving product '%s' (variant=%s, price=%s, stock=%s) ..." % (
        payload["name"], product["variant"], product["price"], product["stock"]))

    resp = save_product(payload)
    _log("save response: %s" % json.dumps(resp, ensure_ascii=False))

    if resp.get("code") == 200:
        _log("SUCCESS: product saved. save returns data=null; the new product "
             "appears under 商品 -> 待审核 (pending review).")
        # try to locate the new product id for convenience
        time.sleep(1)
        for t in (2, 3, 1):
            r = _request("GET", BASE + "/admin/merchant/product/list",
                         params={"page": 1, "limit": 20, "type": t}).json()
            for p in (r.get("data") or {}).get("list", []):
                if p.get("name") == payload["name"]:
                    _log("found new product id=%s in tab type=%s" % (p.get("id"), t))
                    return
    else:
        _log("ERROR: save failed")


if __name__ == "__main__":
    main()
