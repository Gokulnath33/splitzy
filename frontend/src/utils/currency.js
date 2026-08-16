export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function getCurrencySymbol(code = "INR") {
  return CURRENCY_SYMBOLS[code] || "₹";
}
