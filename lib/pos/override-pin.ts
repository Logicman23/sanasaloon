import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_FAILURES = 5;
const LOCKOUT_MINUTES = 15;

export type PinCheck =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "locked" | "invalid"; message: string };

const digest = (value: string) => createHash("sha256").update(value).digest();

/**
 * Checks a manager override PIN against ADMIN_OVERRIDE_PIN, with a per-staff
 * lockout after repeated failures. Every attempt is recorded for auditing.
 */
export async function checkOverridePin(admin: SupabaseClient, staffId: string, pin: string): Promise<PinCheck> {
  const expected = process.env.ADMIN_OVERRIDE_PIN;
  if (!expected) {
    return { ok: false, reason: "not-configured", message: "Discounts are disabled: no manager PIN is configured." };
  }

  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60_000).toISOString();
  const { count, error } = await admin
    .from("discount_override_attempts")
    .select("id", { count: "exact", head: true })
    .eq("staff_id", staffId)
    .eq("succeeded", false)
    .gte("created_at", since);

  if (error) {
    console.error("[pos] Could not check PIN attempts:", error.message);
    // Fail closed: without the attempt history we can't enforce the lockout.
    return { ok: false, reason: "locked", message: "PIN check is unavailable right now. Please try again." };
  }
  if ((count ?? 0) >= MAX_FAILURES) {
    return {
      ok: false,
      reason: "locked",
      message: `Too many incorrect PIN attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
    };
  }

  // Comparing fixed-length digests keeps the comparison constant-time regardless of PIN length.
  const succeeded = timingSafeEqual(digest(pin.trim()), digest(expected));

  const { error: logError } = await admin
    .from("discount_override_attempts")
    .insert({ staff_id: staffId, succeeded });
  if (logError) {
    console.error("[pos] Could not record PIN attempt:", logError.message);
    // Fail closed: an unrecorded attempt would let someone guess past the lockout.
    return { ok: false, reason: "locked", message: "PIN check is unavailable right now. Please try again." };
  }

  return succeeded ? { ok: true } : { ok: false, reason: "invalid", message: "Incorrect manager PIN." };
}
