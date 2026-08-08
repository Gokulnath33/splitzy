/**
 * Given expenses and settlements for a group, calculate:
 * - each member's net balance (positive = owed money, negative = owes money)
 * - the minimum set of transactions to settle everyone up
 */
function calculateBalances(members, expenses, settlements) {
  const balances = {}; // userId -> net balance
  members.forEach((m) => (balances[m._id.toString()] = 0));

  // Each expense: payer gets credited full amount, each person in splitAmong
  // gets debited their equal share
  expenses.forEach((exp) => {
    // exp.paidBy may be a populated user object ({_id, name, ...}) or a raw
    // ObjectId depending on the query — handle both safely.
    const payerId = (exp.paidBy._id || exp.paidBy).toString();
    const splitAmong = exp.splitAmong.length ? exp.splitAmong : members.map((m) => m._id);
    const share = exp.amount / splitAmong.length;

    balances[payerId] = (balances[payerId] || 0) + exp.amount;
    splitAmong.forEach((uid) => {
      const id = (uid._id || uid).toString();
      balances[id] = (balances[id] || 0) - share;
    });
  });

  // Apply any manual settlements (money that has already changed hands)
  settlements.forEach((s) => {
    const fromId = (s.from._id || s.from).toString();
    const toId = (s.to._id || s.to).toString();
    balances[fromId] = (balances[fromId] || 0) + s.amount; // debtor's debt reduced
    balances[toId] = (balances[toId] || 0) - s.amount; // creditor's credit reduced
  });

  return balances;
}

/**
 * Greedy debt-simplification: match biggest debtor with biggest creditor
 * repeatedly until all balances are ~0. Minimizes number of transactions.
 */
function simplifyDebts(balances) {
  const EPSILON = 0.01;
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([userId, amount]) => {
    if (amount > EPSILON) creditors.push({ userId, amount });
    else if (amount < -EPSILON) debtors.push({ userId, amount: -amount });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: Math.round(settledAmount * 100) / 100,
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < EPSILON) i++;
    if (creditor.amount < EPSILON) j++;
  }

  return transactions;
}

module.exports = { calculateBalances, simplifyDebts };
