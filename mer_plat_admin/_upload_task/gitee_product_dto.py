import requests

requests.packages.urllib3.disable_warnings()
H = {"User-Agent": "Mozilla/5.0"}
raw_base = "https://gitee.com/ZhongBangKeJi/crmeb_java/raw/master/"
for p in [
    "crmeb/crmeb-common/src/main/java/com/zbkj/common/request/ProductRequest.java",
    "crmeb/crmeb-common/src/main/java/com/zbkj/common/request/StoreProductRequest.java",
    "crmeb/crmeb-common/src/main/java/com/zbkj/common/request/StoreProductAttrAddRequest.java",
    "crmeb/crmeb-common/src/main/java/com/zbkj/common/request/StoreProductAttrValueAddRequest.java",
]:
    r = requests.get(raw_base + p, headers=H, timeout=30, verify=False)
    print("\n\n===== %s =====\n" % p)
    print(r.text)
