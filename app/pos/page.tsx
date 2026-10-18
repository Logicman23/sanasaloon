import type { Metadata } from "next";
import { LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { signOut } from "@/app/pos/actions";
import { PosTerminal, type TodaySale } from "@/components/pos/pos-terminal";
import { salonNow } from "@/lib/booking";
import { getStaff, type StaffMember } from "@/lib/pos/auth";
import { getActiveServices, getCategories } from "@/lib/services";
import { SITE } from "@/lib/site";
import { createSessionClient } from "@/utils/supabase/session";

export const metadata: Metadata = { title: "Checkout" };

export default function PosPage() {
  return (
    <Suspense fallback={<PosSkeleton />}>
      <PosGate />
    </Suspense>
  );
}

async function PosGate() {
  let auth;
  try {
    auth = await getStaff();
  } catch (err) {
    unstable_rethrow(err); // let Next.js handle its own prerender/redirect signals
    console.error("[pos] Could not check session:", err);
    return <PosMessage title="POS unavailable" body="The POS is not connected to the database yet." />;
  }

  if (auth.status === "signed-out") redirect("/pos/login");
  if (auth.status === "not-staff") {
    return (
      <PosMessage
        title="No POS access"
        body={`${auth.email ?? "This account"} is not an active staff member. Ask the salon owner to add you.`}
        showSignOut
      />
    );
  }

  const [servicesResult, todaySales] = await Promise.all([getActiveServices(), getTodaySales()]);
  if (!servicesResult.ok) {
    return <PosMessage title="Services unavailable" body={servicesResult.error} showSignOut />;
  }

  return (
    <>
      <PosHeader staff={auth.staff} />
      <PosTerminal
        services={servicesResult.services}
        categories={getCategories(servicesResult.services)}
        todaySales={todaySales}
      />
    </>
  );
}

async function getTodaySales(): Promise<TodaySale[]> {
  await connection();
  const { date } = salonNow();
  const startOfDay = new Date(`${date}T00:00:00+05:00`).toISOString(); // Asia/Karachi has no DST

  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, invoice_no, created_at, customer_name, payment_method, total, discount_amount, status")
    .gte("created_at", startOfDay)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[pos] Could not load today's sales:", error.message);
    return [];
  }

  return (data ?? []).map((o) => ({
    id: o.id,
    invoiceNo: Number(o.invoice_no),
    createdAt: o.created_at,
    customerName: o.customer_name,
    paymentMethod: o.payment_method,
    total: Number(o.total),
    discountAmount: Number(o.discount_amount),
    status: o.status,
  }));
}

function PosHeader({ staff }: { staff: StaffMember }) {
  return (
    <header className="border-b border-plum-100 bg-white print:hidden">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="font-display text-xl font-semibold text-plum-800">
            {SITE.shortName}
          </Link>
          <span className="rounded-full bg-plum-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-plum-700 uppercase">
            POS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-right text-sm sm:block">
            <span className="block font-semibold text-ink">{staff.fullName}</span>
            <span className="block text-xs text-ink/55 capitalize">{staff.role}</span>
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-plum-200 px-3.5 py-2 text-sm font-medium text-plum-800 transition hover:bg-plum-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function PosMessage({ title, body, showSignOut }: { title: string; body: string; showSignOut?: boolean }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-3xl border border-plum-100 bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto size-10 text-plum-500" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-plum-900">{title}</h1>
        <p className="mt-2 text-ink/65">{body}</p>
        {showSignOut && (
          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="rounded-full bg-plum-800 px-5 py-2.5 font-semibold text-white transition hover:bg-plum-900"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function PosSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[90rem] animate-pulse gap-6 p-6 lg:grid-cols-[1fr_26rem]" aria-hidden="true">
      <div className="h-[60vh] rounded-3xl bg-white" />
      <div className="h-[60vh] rounded-3xl bg-white" />
    </div>
  );
}
