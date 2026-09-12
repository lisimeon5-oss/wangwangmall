import requests, json

requests.packages.urllib3.disable_warnings()
BASE = "https://yt.mer.sheep2.shop/admin/api"
TOKEN = "merchant6c40b2ca23864e0282da5d9aea75fdf5"
H = {"User-Agent": "Mozilla/5.0", "Authori-zation": TOKEN}
s = requests.Session()
s.headers.update(H)

IMG = "https://yt.pic.sheep2.shop/crmebimage/public/product/2026/09/10/a31f262576384becb0a9d2a1fd6049d3c6i4t50cwg.jpg"

payload = {
    "image": IMG,
    "sliderImage": json.dumps([IMG]),
    "name": "TEST_DELETE_ME_BIg",
    "intro": "test product, delete me",
    "keyword": "test_delete",
    "cateId": "85",
    "brandId": 0,
    "categoryId": 566,
    "guaranteeIds": "",
    "unitName": "件",
    "sort": 1,
    "ficti": 0,
    "specType": False,
    "attrList": [
        {
            "id": 0,
            "attributeName": "规格",
            "isShowImage": False,
            "sort": 0,
            "optionList": [{"id": 0, "optionName": "TEST", "image": "", "sort": 1}]
        }
    ],
    "attrValueList": [
        {
            "id": 0,
            "sku": "TEST",
            "stock": 1,
            "price": "1.00",
            "image": IMG,
            "cost": "0.01",
            "otPrice": "1.00",
            "weight": "0.00",
            "volume": "0.00",
            "brokerage": 0,
            "brokerageTwo": 0,
            "type": 0,
            "quota": 0,
            "quotaShow": 0,
            "attrValue": '{"规格":"TEST"}',
            "barCode": "",
            "expand": "",
            "cdkeyId": 0,
            "cdkeyLibraryName": None,
            "vipPrice": "0.00",
            "redeemIntegral": 0,
            "isShow": True,
            "isDefault": True,
            "itemNumber": ""
        }
    ],
    "content": "<p>test</p>",
    "couponIds": None,
    "flatPattern": "",
    "tempId": 3,
    "isSub": False,
    "type": 0,
    "isPaidMember": False,
    "deliveryMethod": "1",
    "systemFormId": 0,
    "refundSwitch": True,
}

r = s.post(BASE + "/admin/merchant/product/save", json=payload, timeout=60, verify=False)
print("save status", r.status_code)
print("save body", r.text[:3000])
try:
    j = r.json()
    print("save json", json.dumps(j, ensure_ascii=False, indent=2)[:3000])
    pid = j.get("data", {}).get("id") if isinstance(j.get("data"), dict) else None
    if pid:
        dr = s.post(BASE + "/admin/merchant/product/delete", json={"id": pid}, timeout=30, verify=False)
        print("delete status", dr.status_code, dr.text[:500])
except Exception as e:
    print("parse err", e)
