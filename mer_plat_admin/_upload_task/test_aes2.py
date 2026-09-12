import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

w = '{"x":129,"y":5}'
k = '5aCOiqnTSBaCGppZ'
c = AES.new(k.encode('utf-8')[:16], AES.MODE_ECB)
out = base64.b64encode(c.encrypt(pad(w.encode(), 16))).decode()
print("out:", out)
print("expected: VDWo0zT5w3wcyS2E7WWX7g==")
print("match:", out == "VDWo0zT5w3wcyS2E7WWX7g==")
