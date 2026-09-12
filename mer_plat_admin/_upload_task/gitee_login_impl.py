import requests

requests.packages.urllib3.disable_warnings()
H = {"User-Agent": "Mozilla/5.0"}
raw_base = "https://gitee.com/ZhongBangKeJi/crmeb_java/raw/master/"
p = "crmeb/crmeb-admin/src/main/java/com/zbkj/admin/service/impl/AdminLoginServiceImpl.java"
r = requests.get(raw_base + p, headers=H, timeout=30, verify=False)
t = r.text
print(t[:6000])
