// Shared by the POS screen (live totals) and the checkout Server Action (authoritative totals).
// All amounts are whole rupees.

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export const MAX_QUANTITY = 20;
export const MAX_LINES = 50;
export const MAX_UNIT_PRICE = 1_000_000;

export type CartLine = {
  serviceId: string;
  name: string;
  /** Catalog price. The cashier may charge more (e.g. for a price range) but never less without a discount. */
  basePrice: number | null;
  unitPrice: number;
  quantity: number;
};

export type Discount = { type: "percent" | "fixed"; value: number };

export type Totals = { subtotal: number; discountAmount: number; total: number };

export function computeTotals(
  lines: Pick<CartLine, "unitPrice" | "quantity">[],
  discount: Discount | null,
): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  let discountAmount = 0;
  if (discount && discount.value > 0) {
    discountAmount =
      discount.type === "percent"
        ? Math.round((subtotal * Math.min(discount.value, 100)) / 100)
        : Math.round(discount.value);
  }
  discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);
  return { subtotal, discountAmount, total: subtotal - discountAmount };
}

export function paymentLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}
