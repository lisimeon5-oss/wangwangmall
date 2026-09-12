import requests, json, re

requests.packages.urllib3.disable_warnings()
H = {"User-Agent": "Mozilla/5.0"}

# list merchant-related java files
r = requests.get("https://gitee.com/api/v5/repos/ZhongBangKeJi/crmeb_java/git/trees/master?recursive=1", timeout=60, verify=False)
paths = [t["path"] for t in r.json().get("tree", [])]
merch = [p for p in paths if p.endswith(".java") and "merchant" in p.lower()]
print("=== merchant java files (%d) ===" % len(merch))
for p in merch:
    print(p)

# fetch key login files raw
raw_base = "https://gitee.com/ZhongBangKeJi/crmeb_java/raw/master/"
for p in [
    "crmeb/crmeb-common/src/main/java/com/zbkj/common/request/SystemAdminLoginRequest.java",
    "crmeb/crmeb-common/src/main/java/com/zbkj/common/request/SystemAdminLoginCaptchaRequest.java",
]:
    rr = requests.get(raw_base + p, headers=H, timeout=30, verify=False)
    print("\n\n===== %s =====\n" % p)
    print(rr.text[:3000])
