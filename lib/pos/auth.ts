import "server-only";
import { createSessionClient } from "@/utils/supabase/session";

export type StaffMember = {
  userId: string;
  email: string | null;
  fullName: string;
  role: "cashier" | "manager" | "owner";
};

export type StaffLookup =
  | { status: "signed-out" }
  | { status: "not-staff"; email: string | null }
  | { status: "staff"; staff: StaffMember };

/**
 * Verifies the auth cookie (JWT signature/expiry via getClaims) and checks the
 * user is active in public.staff. Use in every POS page and Server Action.
 */
export async function getStaff(): Promise<StaffLookup> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return { status: "signed-out" };

  const email = typeof claims.email === "string" ? claims.email : null;
  const { data: row, error: staffError } = await supabase
    .from("staff")
    .select("user_id, full_name, role, is_active")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (staffError) console.error("[pos] Staff lookup failed:", staffError.message);
  if (!row || !row.is_active) return { status: "not-staff", email };

  return {
    status: "staff",
    staff: { userId: row.user_id, email, fullName: row.full_name, role: row.role },
  };
}
