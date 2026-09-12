import requests, json

requests.packages.urllib3.disable_warnings()
r = requests.get("https://gitee.com/api/v5/repos/ZhongBangKeJi/crmeb_java/git/trees/master?recursive=1", timeout=60, verify=False)
j = r.json()
paths = [t["path"] for t in j.get("tree", [])]
print("total files:", len(paths))
# filter for login/merchant controller + request DTO + auth
interesting = [p for p in paths if re.search(r'(login|Login|merchant|Merchant|auth|Auth|AdminLogin|MerchantLogin)', p)]
import re
for p in interesting:
    if p.endswith(".java") or p.endswith(".vue") or p.endswith(".js"):
        print(p)
