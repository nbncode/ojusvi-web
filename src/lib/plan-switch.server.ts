/**
 * Razorpay subscription plan-switch helpers. Server-only.
 * Every failure is logged into public.plan_switch_failures so callers never
 * have to remember to do it, and no function throws — they always return a
 * result object the caller can branch on.
 */
import { razorpayCredentials } from "./rzp-subscriptions.server";

export type PlanSwitchResult = { success: true } | { success: false; errorMessage: string };

type FailureAction = "update_subscription" | "cancel_subscription";

async function logFailure(
  action: FailureAction,
  razorpaySubscriptionId: string,
  errorMessage: string,
  userId?: string | null,
) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("plan_switch_failures").insert({
      action,
      razorpay_subscription_id: razorpaySubscriptionId,
      error_message: errorMessage,
      user_id: userId ?? null,
    });
    if (error) console.error(`[plan-switch] could not log failure: ${error.message}`);
  } catch (e) {
    console.error(`[plan-switch] could not log failure: ${String(e)}`);
  }
}

function describeError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { description?: string } };
    if (parsed?.error?.description) return parsed.error.description;
  } catch {
    /* not JSON — fall through */
  }
  return `Razorpay returned ${status}${body ? `: ${body.slice(0, 300)}` : ""}`;
}

async function razorpayCall(
  action: FailureAction,
  subscriptionId: string,
  url: string,
  method: "PATCH" | "POST",
  body: unknown,
  userId?: string | null,
): Promise<PlanSwitchResult> {
  const creds = razorpayCredentials();
  if (!creds) {
    const errorMessage = "Razorpay credentials are not configured";
    await logFailure(action, subscriptionId, errorMessage, userId);
    return { success: false, errorMessage };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${btoa(`${creds.keyId}:${creds.keySecret}`)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const errorMessage = `Could not reach Razorpay: ${String(e)}`;
    await logFailure(action, subscriptionId, errorMessage, userId);
    return { success: false, errorMessage };
  }

  if (res.ok) return { success: true };

  const errorMessage = describeError(res.status, await res.text().catch(() => ""));
  await logFailure(action, subscriptionId, errorMessage, userId);
  return { success: false, errorMessage };
}

/** Move an existing subscription onto a different plan. */
export async function attemptSubscriptionUpdate(
  subscriptionId: string,
  newPlanId: string,
  scheduleChangeAt: "now" | "cycle_end",
  userId?: string | null,
): Promise<PlanSwitchResult> {
  return razorpayCall(
    "update_subscription",
    subscriptionId,
    `https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
    "PATCH",
    { plan_id: newPlanId, schedule_change_at: scheduleChangeAt },
    userId,
  );
}

/** Cancel an existing subscription, immediately or at the end of the cycle. */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean,
  userId?: string | null,
): Promise<PlanSwitchResult> {
  return razorpayCall(
    "cancel_subscription",
    subscriptionId,
    `https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    "POST",
    { cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 },
    userId,
  );
}
