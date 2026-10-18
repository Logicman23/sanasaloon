"use client";

import {
  BadgePercent,
  CircleAlert,
  LoaderCircle,
  Minus,
  Plus,
  Printer,
  Receipt as ReceiptIcon,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { checkout, verifyDiscountPin, type Receipt } from "@/app/pos/actions";
import { CategoryIcon } from "@/components/category-icon";
import { Modal } from "@/components/pos/modal";
import { displayPrice, formatRupees } from "@/lib/format";
import {
  computeTotals,
  MAX_QUANTITY,
  MAX_UNIT_PRICE,
  PAYMENT_METHODS,
  paymentLabel,
  type CartLine,
  type Discount,
  type PaymentMethod,
} from "@/lib/pos/pricing";
import { FULL_ADDRESS, SITE } from "@/lib/site";
import type { Service } from "@/lib/types";

export type TodaySale = {
  id: string;
  invoiceNo: number;
  createdAt: string;
  customerName: string | null;
  paymentMethod: string;
  total: number;
  discountAmount: number;
  status: string;
};

type ApprovedDiscount = Discount & { pin: string; reason: string };

const ALL = "All";

const timeFmt = new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" });
const dateTimeFmt = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

const invoiceLabel = (n: number) => `SBS-${String(n).padStart(5, "0")}`;

export function PosTerminal({
  services,
  categories,
  todaySales,
}: {
  services: Service[];
  categories: string[];
  todaySales: TodaySale[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount, setDiscount] = useState<ApprovedDiscount | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter(
      (s) => (category === ALL || s.category === category) && (!q || s.name.toLowerCase().includes(q)),
    );
  }, [services, category, query]);

  const totals = computeTotals(lines, discount);
  const invalidLine = lines.find(
    (l) => !Number.isInteger(l.unitPrice) || l.unitPrice <= 0 || (l.basePrice != null && l.unitPrice < l.basePrice),
  );

  const addService = (service: Service) => {
    setError(null);
    setLines((current) => {
      const existing = current.find((l) => l.serviceId === service.id);
      if (existing) {
        return current.map((l) =>
          l.serviceId === service.id ? { ...l, quantity: Math.min(l.quantity + 1, MAX_QUANTITY) } : l,
        );
      }
      const basePrice = service.price == null ? null : Math.round(Number(service.price));
      return [
        ...current,
        { serviceId: service.id, name: service.name, basePrice, unitPrice: basePrice ?? 0, quantity: 1 },
      ];
    });
  };

  const updateLine = (serviceId: string, patch: Partial<CartLine>) =>
    setLines((current) => current.map((l) => (l.serviceId === serviceId ? { ...l, ...patch } : l)));

  const removeLine = (serviceId: string) => setLines((current) => current.filter((l) => l.serviceId !== serviceId));

  const resetSale = () => {
    setLines([]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("cash");
    setDiscount(null);
    setError(null);
  };

  const completeSale = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await checkout({
        lines: lines.map(({ serviceId, unitPrice, quantity }) => ({ serviceId, unitPrice, quantity })),
        discount,
        paymentMethod,
        customerName,
        customerPhone,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReceipt(result.receipt);
      resetSale();
      router.refresh(); // updates "Today's sales"
    } catch (err) {
      console.error(err);
      setError("Connection problem. Check the internet and try again. The sale was not saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const todayPaid = todaySales.filter((s) => s.status === "paid");
  const todayTotal = todayPaid.reduce((sum, s) => sum + s.total, 0);

  return (
    <main className="mx-auto grid w-full max-w-[90rem] flex-1 gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_26rem]">
      {/* ------------------------------------------------ Catalog */}
      <section aria-label="Services" className="min-w-0 space-y-6">
        <div className="rounded-3xl border border-plum-100 bg-white p-4 sm:p-5">
          <label className="relative block">
            <span className="sr-only">Search services</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              className="block w-full rounded-xl border border-plum-200 bg-plum-50/50 py-3 pr-4 pl-12 outline-none focus:border-plum-500 focus:bg-white focus:ring-4 focus:ring-plum-100"
            />
          </label>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {[ALL, ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={c === category}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  c === category
                    ? "border-plum-800 bg-plum-800 text-white"
                    : "border-plum-200 bg-white text-ink/75 hover:border-plum-300"
                }`}
              >
                {c !== ALL && <CategoryIcon category={c} className="size-4" />}
                {c}
              </button>
            ))}
          </div>

          {visible.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((service) => {
                const inCart = lines.find((l) => l.serviceId === service.id)?.quantity ?? 0;
                return (
                  <li key={service.id}>
                    <button
                      type="button"
                      onClick={() => addService(service)}
                      className={`relative flex h-full w-full flex-col items-start rounded-2xl border p-4 text-left transition hover:border-plum-400 hover:shadow-sm active:scale-[0.99] ${
                        inCart ? "border-plum-500 bg-plum-50" : "border-plum-100 bg-white"
                      }`}
                    >
                      {inCart > 0 && (
                        <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-plum-800 text-xs font-bold text-white">
                          {inCart}
                        </span>
                      )}
                      <span className="text-xs text-ink/50">{service.category}</span>
                      <span className="mt-1 pr-6 font-semibold leading-snug text-ink">{service.name}</span>
                      <span className="mt-auto pt-3 font-semibold text-plum-800">{displayPrice(service)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-plum-200 p-8 text-center text-sm text-ink/55">
              No services match your search.
            </p>
          )}
        </div>

        <TodaySales sales={todaySales} count={todayPaid.length} total={todayTotal} />
      </section>

      {/* ------------------------------------------------ Bill */}
      <section
        aria-label="Current bill"
        className="flex flex-col rounded-3xl border border-plum-100 bg-white lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)]"
      >
        <div className="flex items-center justify-between border-b border-plum-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-plum-900">
            <ReceiptIcon className="size-5" aria-hidden="true" />
            Current Bill
          </h2>
          {lines.length > 0 && (
            <button type="button" onClick={resetSale} className="text-sm font-medium text-ink/55 hover:text-red-700">
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink/50">Tap a service to add it to the bill.</p>
          ) : (
            <ul className="divide-y divide-plum-100">
              {lines.map((line) => {
                const belowMenu = line.basePrice != null && line.unitPrice < line.basePrice;
                const missing = line.unitPrice <= 0;
                return (
                  <li key={line.serviceId} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium leading-snug text-ink">{line.name}</p>
                      <button
                        type="button"
                        onClick={() => removeLine(line.serviceId)}
                        aria-label={`Remove ${line.name}`}
                        className="shrink-0 rounded-full p-1 text-ink/40 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-plum-200">
                        <button
                          type="button"
                          onClick={() =>
                            line.quantity === 1
                              ? removeLine(line.serviceId)
                              : updateLine(line.serviceId, { quantity: line.quantity - 1 })
                          }
                          aria-label="Decrease quantity"
                          className="flex size-8 items-center justify-center rounded-full hover:bg-plum-50"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold" aria-label="Quantity">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateLine(line.serviceId, { quantity: Math.min(line.quantity + 1, MAX_QUANTITY) })
                          }
                          disabled={line.quantity >= MAX_QUANTITY}
                          aria-label="Increase quantity"
                          className="flex size-8 items-center justify-center rounded-full hover:bg-plum-50 disabled:opacity-40"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <label className="flex flex-1 items-center gap-1.5 rounded-xl border border-plum-200 px-3 py-1.5 focus-within:border-plum-500 focus-within:ring-2 focus-within:ring-plum-100">
                        <span className="text-xs text-ink/50">Rs.</span>
                        <span className="sr-only">Unit price for {line.name}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={line.basePrice ?? 1}
                          max={MAX_UNIT_PRICE}
                          step={1}
                          value={line.unitPrice || ""}
                          onChange={(e) =>
                            updateLine(line.serviceId, {
                              unitPrice: Math.min(Math.max(Math.trunc(Number(e.target.value) || 0), 0), MAX_UNIT_PRICE),
                            })
                          }
                          className="w-full min-w-0 bg-transparent text-right text-sm font-semibold outline-none"
                        />
                      </label>
                      <span className="w-24 text-right text-sm font-semibold text-ink">
                        {formatRupees(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                    {(belowMenu || missing) && (
                      <p className="mt-1.5 text-xs text-red-700">
                        {missing
                          ? "Enter the price charged."
                          : `Menu price is ${formatRupees(line.basePrice!)}. Use a manager discount to charge less.`}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4 border-t border-plum-100 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              aria-label="Customer name (optional)"
              maxLength={80}
              className="rounded-xl border border-plum-200 px-3 py-2.5 text-sm outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-100"
            />
            <input
              type="tel"
              inputMode="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (optional)"
              aria-label="Customer phone (optional)"
              className="rounded-xl border border-plum-200 px-3 py-2.5 text-sm outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-100"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold tracking-wide text-ink/55 uppercase">Payment</legend>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPaymentMethod(m.value)}
                  aria-pressed={paymentMethod === m.value}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    paymentMethod === m.value
                      ? "border-plum-800 bg-plum-800 text-white"
                      : "border-plum-200 text-ink/75 hover:border-plum-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>

          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="font-medium">{formatRupees(totals.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>
                {discount ? (
                  <span className="inline-flex items-center gap-1.5 text-gold-600">
                    <BadgePercent className="size-4" aria-hidden="true" />
                    Discount {discount.type === "percent" ? `(${discount.value}%)` : ""}
                    <button
                      type="button"
                      onClick={() => setDiscount(null)}
                      aria-label="Remove discount"
                      className="rounded-full p-0.5 text-ink/40 hover:bg-plum-50 hover:text-red-700"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDiscountOpen(true)}
                    disabled={lines.length === 0}
                    className="inline-flex items-center gap-1.5 font-medium text-plum-700 hover:text-plum-900 disabled:opacity-40"
                  >
                    <BadgePercent className="size-4" aria-hidden="true" />
                    Manager discount
                  </button>
                )}
              </dt>
              <dd className="font-medium text-gold-600">
                {totals.discountAmount > 0 ? `− ${formatRupees(totals.discountAmount)}` : ""}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-plum-100 pt-3">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-display text-3xl font-semibold text-plum-900">{formatRupees(totals.total)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={completeSale}
            disabled={submitting || lines.length === 0 || !!invalidLine}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-3.5 text-lg font-semibold text-white transition hover:bg-plum-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
            {submitting ? "Saving sale…" : `Complete Sale · ${formatRupees(totals.total)}`}
          </button>
        </div>
      </section>

      <DiscountDialog
        open={discountOpen}
        subtotal={totals.subtotal}
        onClose={() => setDiscountOpen(false)}
        onApprove={(d) => {
          setDiscount(d);
          setDiscountOpen(false);
        }}
      />

      <ReceiptDialog receipt={receipt} onClose={() => setReceipt(null)} />
    </main>
  );
}

// ---------------------------------------------------------------------------

function DiscountDialog({
  open,
  subtotal,
  onClose,
  onApprove,
}: {
  open: boolean;
  subtotal: number;
  onClose: () => void;
  onApprove: (discount: ApprovedDiscount) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Manager discount">
      {/* Remount the form each time the dialog opens so no PIN lingers in state. */}
      {open && <DiscountForm subtotal={subtotal} onApprove={onApprove} />}
    </Modal>
  );
}

function DiscountForm({ subtotal, onApprove }: { subtotal: number; onApprove: (d: ApprovedDiscount) => void }) {
  const [type, setType] = useState<Discount["type"]>("percent");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numeric = Number(value);
  const preview = computeTotals([{ unitPrice: subtotal, quantity: 1 }], { type, value: numeric || 0 });
  const valid = numeric > 0 && (type === "fixed" ? numeric <= subtotal : numeric <= 100);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || !pin) return;
    setChecking(true);
    setError(null);
    try {
      const result = await verifyDiscountPin(pin);
      if (result.ok) onApprove({ type, value: numeric, pin, reason: reason.trim() });
      else {
        setError(result.message ?? "Incorrect manager PIN.");
        setPin("");
      }
    } catch {
      setError("Connection problem. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-plum-50 p-1">
        {(["percent", "fixed"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={`rounded-full py-2 text-sm font-semibold transition ${type === t ? "bg-white text-plum-800 shadow-sm" : "text-ink/60"}`}
          >
            {t === "percent" ? "Percentage %" : "Amount Rs."}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="discount-value" className="mb-1.5 block text-sm font-semibold">
          {type === "percent" ? "Discount (%)" : "Discount (Rs.)"}
        </label>
        <input
          id="discount-value"
          type="number"
          inputMode="decimal"
          min={0}
          max={type === "percent" ? 100 : subtotal}
          step={type === "percent" ? 0.5 : 1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          autoFocus
          className="block w-full rounded-xl border border-plum-200 px-4 py-3 outline-none focus:border-plum-500 focus:ring-4 focus:ring-plum-100"
        />
        <p className="mt-1.5 text-sm text-ink/60">
          {valid
            ? `− ${formatRupees(preview.discountAmount)} · New total ${formatRupees(preview.total)}`
            : type === "percent"
              ? "Enter a percentage between 0 and 100."
              : `Enter an amount up to ${formatRupees(subtotal)}.`}
        </p>
      </div>

      <div>
        <label htmlFor="discount-reason" className="mb-1.5 block text-sm font-semibold">
          Reason <span className="font-normal text-ink/50">(optional)</span>
        </label>
        <input
          id="discount-reason"
          type="text"
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Regular client, bridal package deal"
          className="block w-full rounded-xl border border-plum-200 px-4 py-3 outline-none focus:border-plum-500 focus:ring-4 focus:ring-plum-100"
        />
      </div>

      <div>
        <label htmlFor="manager-pin" className="mb-1.5 block text-sm font-semibold">
          Manager PIN
        </label>
        <input
          id="manager-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
          className="block w-full rounded-xl border border-plum-200 px-4 py-3 tracking-[0.4em] outline-none focus:border-plum-500 focus:ring-4 focus:ring-plum-100"
        />
      </div>

      {error && (
        <p role="alert" className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || !pin || checking}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-3 font-semibold text-white transition hover:bg-plum-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checking && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
        {checking ? "Checking PIN…" : "Apply discount"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------

function ReceiptDialog({ receipt, onClose }: { receipt: Receipt | null; onClose: () => void }) {
  return (
    <Modal open={!!receipt} onClose={onClose} title="Sale complete" className="receipt-dialog">
      {receipt && (
        <>
          <div id="receipt" className="rounded-2xl border border-plum-100 p-5 text-sm">
            <div className="text-center">
              <p className="font-display text-xl font-semibold">{SITE.name}</p>
              <p className="text-xs text-ink/60">{FULL_ADDRESS}</p>
              {SITE.phone && <p className="text-xs text-ink/60">{SITE.phone}</p>}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-1 border-y border-dashed border-plum-200 py-3 text-xs">
              <dt className="text-ink/55">Invoice</dt>
              <dd className="text-right font-semibold">{invoiceLabel(receipt.invoiceNo)}</dd>
              <dt className="text-ink/55">Date</dt>
              <dd className="text-right">{dateTimeFmt.format(new Date(receipt.createdAt))}</dd>
              <dt className="text-ink/55">Cashier</dt>
              <dd className="text-right">{receipt.cashier}</dd>
              {receipt.customerName && (
                <>
                  <dt className="text-ink/55">Customer</dt>
                  <dd className="text-right">{receipt.customerName}</dd>
                </>
              )}
            </dl>
            <table className="mt-3 w-full">
              <thead className="sr-only">
                <tr>
                  <th>Item</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i} className="align-top">
                    <td className="py-1 pr-3">
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="block text-xs text-ink/55">
                          {item.quantity} × {formatRupees(item.unitPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-1 text-right whitespace-nowrap">{formatRupees(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-3 space-y-1 border-t border-dashed border-plum-200 pt-3">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatRupees(receipt.subtotal)}</dd>
              </div>
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt>{receipt.discountLabel}</dt>
                  <dd>− {formatRupees(receipt.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd>{formatRupees(receipt.total)}</dd>
              </div>
              <div className="flex justify-between text-xs text-ink/60">
                <dt>Paid by</dt>
                <dd>{paymentLabel(receipt.paymentMethod)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-center text-xs text-ink/55">Thank you for visiting! Review us on Google.</p>
          </div>
          <div className="mt-5 flex gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-plum-200 px-5 py-3 font-semibold text-plum-800 transition hover:bg-plum-50"
            >
              <Printer className="size-5" aria-hidden="true" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-plum-800 px-5 py-3 font-semibold text-white transition hover:bg-plum-900"
            >
              New sale
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------------

function TodaySales({ sales, count, total }: { sales: TodaySale[]; count: number; total: number }) {
  return (
    <div className="rounded-3xl border border-plum-100 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-plum-900">Today&apos;s sales</h2>
        <p className="text-sm text-ink/60">
          {count} {count === 1 ? "sale" : "sales"} · <span className="font-semibold text-ink">{formatRupees(total)}</span>
        </p>
      </div>
      {sales.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">No sales recorded yet today.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs text-ink/50 uppercase">
              <tr>
                <th className="py-2 font-semibold">Invoice</th>
                <th className="py-2 font-semibold">Time</th>
                <th className="py-2 font-semibold">Customer</th>
                <th className="py-2 font-semibold">Payment</th>
                <th className="py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-100">
              {sales.map((s) => (
                <tr key={s.id} className={s.status === "void" ? "text-ink/40 line-through" : ""}>
                  <td className="py-2.5 font-medium">{invoiceLabel(s.invoiceNo)}</td>
                  <td className="py-2.5">{timeFmt.format(new Date(s.createdAt))}</td>
                  <td className="py-2.5">{s.customerName ?? "Walk-in"}</td>
                  <td className="py-2.5">{paymentLabel(s.paymentMethod)}</td>
                  <td className="py-2.5 text-right font-semibold">
                    {formatRupees(s.total)}
                    {s.discountAmount > 0 && <span className="ml-1 text-xs font-normal text-gold-600">(disc.)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
