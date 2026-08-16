const assert = require("assert");
const { calculateBalances, simplifyDebts } = require("../utils/settleUp");

console.log("▶ Running settleUp unit tests...");

// Test 1: Equal Split
(function testEqualSplit() {
  const members = [{ _id: "user1" }, { _id: "user2" }, { _id: "user3" }];
  const expenses = [
    {
      paidBy: "user1",
      amount: 300,
      splitType: "EQUAL",
      splitAmong: ["user1", "user2", "user3"],
    },
  ];
  const settlements = [];

  const balances = calculateBalances(members, expenses, settlements);
  assert.strictEqual(balances["user1"], 200, "User1 should be owed 200");
  assert.strictEqual(balances["user2"], -100, "User2 should owe 100");
  assert.strictEqual(balances["user3"], -100, "User3 should owe 100");

  const transactions = simplifyDebts(balances);
  assert.strictEqual(transactions.length, 2, "Should require 2 transactions");
  console.log("✅ Test 1 passed: Equal Split & Debt Simplification");
})();

// Test 2: Exact Split
(function testExactSplit() {
  const members = [{ _id: "user1" }, { _id: "user2" }, { _id: "user3" }];
  const expenses = [
    {
      paidBy: "user1",
      amount: 100,
      splitType: "EXACT",
      splitDetails: [
        { user: "user1", amount: 20 },
        { user: "user2", amount: 50 },
        { user: "user3", amount: 30 },
      ],
    },
  ];
  const settlements = [];

  const balances = calculateBalances(members, expenses, settlements);
  assert.strictEqual(balances["user1"], 80, "User1 balance should be 80");
  assert.strictEqual(balances["user2"], -50, "User2 balance should be -50");
  assert.strictEqual(balances["user3"], -30, "User3 balance should be -30");

  const transactions = simplifyDebts(balances);
  assert.strictEqual(transactions.length, 2, "Should require 2 transactions");
  console.log("✅ Test 2 passed: Exact Split");
})();

// Test 3: Percentage Split
(function testPercentageSplit() {
  const members = [{ _id: "user1" }, { _id: "user2" }];
  const expenses = [
    {
      paidBy: "user1",
      amount: 200,
      splitType: "PERCENTAGE",
      splitDetails: [
        { user: "user1", percentage: 70 },
        { user: "user2", percentage: 30 },
      ],
    },
  ];
  const settlements = [];

  const balances = calculateBalances(members, expenses, settlements);
  assert.strictEqual(balances["user1"], 60, "User1 balance should be 60");
  assert.strictEqual(balances["user2"], -60, "User2 balance should be -60");

  const transactions = simplifyDebts(balances);
  assert.strictEqual(transactions.length, 1, "Should require 1 transaction");
  assert.strictEqual(transactions[0].from, "user2");
  assert.strictEqual(transactions[0].to, "user1");
  assert.strictEqual(transactions[0].amount, 60);
  console.log("✅ Test 3 passed: Percentage Split");
})();

console.log("\n🎉 All unit tests passed successfully!\n");
