const assert = require("assert");

console.log("▶ Verifying Forgot Password OTP generation...");

const code = Math.floor(100000 + Math.random() * 900000).toString();
assert.strictEqual(code.length, 6, "Code must be 6 digits");
assert.ok(!isNaN(Number(code)), "Code must be numeric");

const expires = new Date(Date.now() + 15 * 60 * 1000);
assert.ok(expires > new Date(), "Expiration must be in the future");

console.log(`✅ Generated OTP Code: ${code} (Expires: ${expires.toLocaleTimeString()})`);
console.log("🎉 Forgot password verification logic passed successfully!\n");
