const CryptoJS = require('crypto-js');
function aesEncrypt(word, keyWord = 'XwKsGlMcdPMEhR1B') {
  var key = CryptoJS.enc.Utf8.parse(keyWord);
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.toString();
}
const word = JSON.stringify({ x: 129, y: 5.0 });
console.log("word:", word);
console.log("default key:", aesEncrypt(word));
console.log("secretKey:", aesEncrypt(word, "5aCOiqnTSBaCGppZ"));
console.log("secretKey2:", aesEncrypt(word, "E2tMOHviCzZYMJBe"));
