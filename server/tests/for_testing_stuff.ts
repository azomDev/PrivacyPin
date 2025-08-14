const aaa = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
const bbb = aaa.publicKey;
const ccc = await crypto.subtle.exportKey("jwk", bbb);
console.log(ccc)
const ddd = JSON.stringify(ccc);
console.log(ddd)
const eee = JSON.parse(ddd)
console.log(eee)
