# Add a dedicated failed-payment page

## Goal
Create a standalone `/payment-failed` page so users who close the Razorpay modal, get a bank decline, or hit an order error land somewhere helpful instead of seeing only an inline message on `/pay`.

## What will change

### 1. New route: `src/routes/payment-failed.tsx`
- URL: `/payment-failed`
- Search params (optional):
  - `reason`: `"failed" | "dismissed" | "order"`
  - `order`: Razorpay order id, for support reference
- Design matches the existing Ojusvi checkout aesthetic (parchment background, forest accents, serif italic headings).
- Content:
  - Heading and message change based on `reason`.
  - Reassurance that no money was deducted.
  - Primary CTA: "Try payment again" → links back to `/pay`.
  - Secondary CTA: "Start 30 days free" → `/download` (monthly-style fallback).
  - Support line: Call / WhatsApp `+91 99589 05337`.
- `head()` with route-specific title/description, `og:type`, `twitter:card`, and `robots: noindex`.

### 2. Update `src/routes/pay.tsx`
- Replace the inline `failure` block with a redirect to `/payment-failed`.
- In `handlePay`, when any of these happen:
  - `payment.failed` event fires (`kind: "failed"`),
  - user dismisses the Razorpay modal (`kind: "dismissed"`),
  - order creation throws (`kind: "order"`),
- navigate to `/payment-failed?reason=<kind>&order=<order_id>` instead of setting local `failure` state.
- Keep the `confirming` spinner and `/thank-you` success path unchanged.
- Remove or repurpose the now-unused `failure` state and its inline UI.

## Out of scope
- No changes to Razorpay webhook logic.
- No changes to the success `/thank-you` page.
- No new database tables or migrations.

## Acceptance criteria
- `/payment-failed` renders with correct messaging for each `reason`.
- Closing the Razorpay modal on `/pay` redirects to `/payment-failed?reason=dismissed`.
- A Razorpay `payment.failed` event redirects to `/payment-failed?reason=failed`.
- Order creation errors redirect to `/payment-failed?reason=order`.
- "Try payment again" returns the user to `/pay`.
- Build and typecheck pass.
