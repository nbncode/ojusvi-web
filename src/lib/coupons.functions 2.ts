import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  code: z.string().trim().min(1).max(40),
  plan: z.enum(["annual", "monthly"]),
});

/** Checks a coupon for the signed-in user. Purely advisory — order creation re-validates. */
export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof inputSchema>) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { validateCouponServer } = await import("./coupons.server");
    return validateCouponServer({ rawCode: data.code, plan: data.plan, userId: context.userId });
  });
