"use server";

import { redirect } from "next/navigation";
import { normalizePkPhone } from "@/lib/booking";
import { getStaff } from "@/lib/pos/auth";
import { checkOverridePin } from "@/lib/pos/override-pin";
import {
  computeTotals,
  MAX_LINES,
  MAX_QUANTITY,
  MAX_UNIT_PRICE,
  PAYMENT_METHODS,
  type Discount,
  type PaymentMethod,
} from "@/lib/pos/pricing";
import { createAdminClient, SupabaseAdminConfigError } from "@/utils/supabase/admin";
import { createSessionClient } from "@/utils/supabase/session";

// ---------------------------------------------------------------------------
// Sign in / out
// ---------------------------------------------------------------------------

export type SignInState = { error: string | null; email: string };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Same message for unknown email and wrong password, so accounts can't be enumerated.
      return { error: "Incorrect email or password.", email };
    }
  } catch (err) {
    console.error("[pos] Sign-in failed:", err);
    return { error: "Sign-in is unavailable right now. Please try again.", email };
  }

  redirect("/pos");
}

export async function signOut() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[pos] Sign-out failed:", err);
  }
  redirect("/pos/login");
}

// ---------------------------------------------------------------------------
// Manager discount PIN (instant feedback in the discount dialog; checkout re-checks it)
// ---------------------------------------------------------------------------

export async function verifyDiscountPin(pin: string): Promise<{ ok: boolean; message?: string }> {
  const auth = await getStaff();
  if (auth.status !== "staff") return { ok: false, message: "Your session has expired. Please sign in again." };

  try {
    const result = await checkOverridePin(createAdminClient(), auth.staff.userId, String(pin ?? ""));
    return result.ok ? { ok: true } : { ok: false, message: result.message };
  } catch (err) {
    return { ok: false, message: adminErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export type CheckoutInput = {
  lines: { serviceId: string; unitPrice: number; quantity: number }[];
  discount: (Discount & { pin: string; reason: string }) | null;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
};

export type Receipt = {
  orderId: string;
  invoiceNo: number;
  createdAt: string;
  cashier: string;
  customerName: string | null;
  customerPhone: string | null;
  paymentMethod: PaymentMethod;
  items: { name: string; unitPrice: number; quantity: number; lineTotal: number }[];
  subtotal: number;
  discountAmount: number;
  discountLabel: string | null;
  total: number;
};

export type CheckoutResult = { ok: true; receipt: Receipt } | { ok: false; error: string };

export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const auth = await getStaff();
  if (auth.status !== "staff") return { ok: false, error: "Your session has expired. Please sign in again." };
  const { staff } = auth;

  // --- Validate the cart shape -------------------------------------------
  const rawLines = Array.isArray(input?.lines) ? input.lines : [];
  if (rawLines.length === 0) return { ok: false, error: "Add at least one service to the bill." };
  if (rawLines.length > MAX_LINES) return { ok: false, error: "Too many items on one bill." };

  for (const line of rawLines) {
    if (
      typeof line?.serviceId !== "string" ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > MAX_QUANTITY ||
      !Number.isInteger(line.unitPrice) ||
      line.unitPrice < 0 ||
      line.unitPrice > MAX_UNIT_PRICE
    ) {
      return { ok: false, error: "One of the bill items is invalid. Please remove it and add it again." };
    }
  }

  if (!PAYMENT_METHODS.some((m) => m.value === input.paymentMethod)) {
    return { ok: false, error: "Choose a payment method." };
  }

  const customerName = String(input.customerName ?? "").trim().replace(/\s+/g, " ").slice(0, 80) || null;
  const rawPhone = String(input.customerPhone ?? "").trim();
  const customerPhone = rawPhone ? normalizePkPhone(rawPhone) : null;
  if (rawPhone && !customerPhone) return { ok: false, error: "Customer phone number looks invalid." };

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { ok: false, error: adminErrorMessage(err) };
  }

  // --- Re-price every line from the database ------------------------------
  const ids = [...new Set(rawLines.map((l) => l.serviceId))];
  const { data: services, error: servicesError } = await admin
    .from("services")
    .select("id, name, price, is_active")
    .in("id", ids);

  if (servicesError) {
    console.error("[pos] Could not load services for checkout:", servicesError.message);
    return { ok: false, error: "Couldn't verify prices. Please try again." };
  }

  const byId = new Map((services ?? []).map((s) => [s.id as string, s]));
  const items: Receipt["items"] = [];
  for (const line of rawLines) {
    const service = byId.get(line.serviceId);
    if (!service || !service.is_active) {
      return { ok: false, error: "A service on this bill is no longer available. Please remove it." };
    }
    const catalogPrice = service.price == null ? null : Math.round(Number(service.price));
    // Charging more than the catalog price is allowed (e.g. "Rs. 15,000 – 25,000" ranges).
    // Charging less is a discount and must go through the manager PIN.
    if (catalogPrice != null && line.unitPrice < catalogPrice) {
      return {
        ok: false,
        error: `${service.name} can't be charged below its menu price. Use a manager discount instead.`,
      };
    }
    if (catalogPrice == null && line.unitPrice <= 0) {
      return { ok: false, error: `Enter the price charged for ${service.name}.` };
    }
    items.push({
      name: service.name,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.unitPrice * line.quantity,
    });
  }

  // --- Discount (manager PIN required) -----------------------------------
  let discount: Discount | null = null;
  let discountReason: string | null = null;
  if (input.discount && Number(input.discount.value) > 0) {
    const { type, value } = input.discount;
    if ((type !== "percent" && type !== "fixed") || !Number.isFinite(value) || value < 0) {
      return { ok: false, error: "The discount is invalid." };
    }
    if (type === "percent" && value > 100) return { ok: false, error: "A discount can't be more than 100%." };

    const pin = await checkOverridePin(admin, staff.userId, String(input.discount.pin ?? ""));
    if (!pin.ok) return { ok: false, error: pin.message };

    discount = { type, value };
    discountReason = String(input.discount.reason ?? "").trim().slice(0, 200) || null;
  }

  const totals = computeTotals(items, discount);

  // --- Save atomically ----------------------------------------------------
  const { data: created, error: createError } = await admin
    .rpc("create_pos_order", {
      p_order: {
        staff_id: staff.userId,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: input.paymentMethod,
        subtotal: totals.subtotal,
        discount_type: discount?.type ?? null,
        discount_value: discount?.value ?? 0,
        discount_amount: totals.discountAmount,
        discount_reason: discountReason,
        total: totals.total,
      },
      p_items: rawLines.map((line, i) => ({
        service_id: line.serviceId,
        service_name: items[i].name,
        unit_price: line.unitPrice,
        quantity: line.quantity,
      })),
    })
    .single<{ id: string; invoice_no: number; created_at: string }>();

  if (createError || !created) {
    console.error("[pos] create_pos_order failed:", createError?.code, createError?.message);
    return { ok: false, error: "The sale could not be saved. Please try again." };
  }

  return {
    ok: true,
    receipt: {
      orderId: created.id,
      invoiceNo: Number(created.invoice_no),
      createdAt: created.created_at,
      cashier: staff.fullName,
      customerName,
      customerPhone,
      paymentMethod: input.paymentMethod,
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      discountLabel: discount
        ? discount.type === "percent"
          ? `Manager discount (${discount.value}%)`
          : "Manager discount"
        : null,
      total: totals.total,
    },
  };
}

function adminErrorMessage(err: unknown): string {
  if (err instanceof SupabaseAdminConfigError) {
    console.error(`[pos] ${err.message}`);
    return "The POS isn't fully configured yet (missing server key). Please contact the administrator.";
  }
  console.error("[pos] Unexpected error:", err);
  return "Something went wrong. Please try again.";
}
