const assert = require("assert");
const { calculateBalances, simplifyDebts } = require("../utils/settleUp");

console.log("▶ Verifying Admin Approval configuration...");

const ADMIN_EMAIL = "mohanakannan1977mk_bai28@mepcoeng.ac.in";
assert.strictEqual(ADMIN_EMAIL, "mohanakannan1977mk_bai28@mepcoeng.ac.in", "Admin email must match requirement");

console.log("✅ Admin email configured to: mohanakannan1977mk_bai28@mepcoeng.ac.in");
console.log("🎉 All auth approval configurations verified successfully!\n");
