import requests, json, re

requests.packages.urllib3.disable_warnings()
H = {"User-Agent": "Mozilla/5.0"}
r = requests.get("https://gitee.com/api/v5/repos/ZhongBangKeJi/crmeb_java/git/trees/master?recursive=1", timeout=60, verify=False)
paths = [t["path"] for t in r.json().get("tree", [])]
# find product request DTOs
prod = [p for p in paths if re.search(r'[Pp]roduct.*\.java$', p)]
print("=== Product-related java files (%d) ===" % len(prod))
for p in prod:
    print(p)
