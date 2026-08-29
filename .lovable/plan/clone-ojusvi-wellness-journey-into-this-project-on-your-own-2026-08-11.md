# Clone "Ojusvi Wellness Journey" into this project, on your own Supabase

Goal: this project ends up as a faithful copy of the source app (same pages, design, assets, payment and OTP flows), with its backend pointed at your existing Supabase project instead of the original one. Schema only — no existing rows or users are carried over.

## What you need to do first (one step, only you can do it)

Connect your Supabase project to this Lovable project:

1. Open this project's settings and choose the Supabase integration.
2. Authorize Supabase and select the project you want to use.

I cannot attach an external Supabase account from my side, and until it is attached the app has no keys and no place to run the schema. Everything below happens after that.

## Step 1 — Copy the app

- Copy all pages from the source: home, become-an-instructor, earnings calculator, pay, download, thank-you, account-deletion, and the legal pages (privacy, terms, refund, security), plus the sitemap route.
- Copy the shared components (nav, hero, wellness wheel, pillars, yoga system, pricing, voices, FAQ, footer, timeline, earnings calculator, sticky mobile CTA, animation helpers), the full UI component set, hooks, and the design system (fonts, colors, styles).
- Install the extra packages the source uses (animation, QR codes, charts, forms, date utilities and the Supabase client).
- Copy the images that are real files in the source. 17 images are stored as project-scoped pointers (logos, program photos, tambola artwork, the eight QR/code images); I will download each from the source project and re-upload it here. If any single one cannot be fetched I will tell you which, and use a placeholder rather than shipping a broken image.

## Step 2 — Recreate the database schema in your Supabase project

Apply the source project's 8 migrations, in order, producing:

- Tables: `profiles`, `plans`, `payments`, `payment_intents`, `entitlements`, `subscriptions`, `instructor_applications`, `coupons`, `coupon_redemptions`.
- Enum types for payment intent type/status and entitlement source/status.
- Row Level Security policies and Data API grants exactly as in the source.
- The seed rows the migrations contain (plans, coupons) so pricing and checkout work immediately.

Then regenerate the typed database definitions so the copied code compiles against your project.

## Step 3 — Rewire the backend code to your project

- Point the browser, authenticated-server, and admin Supabase clients at your project's URL and keys.
- Keep the server functions and public webhook routes intact: checkout, coupons, payments, subscriptions, the Razorpay webhook, and the instructor-application sync hook.
- Copy the three phone-OTP edge functions (send OTP, verify OTP, SMS auth hook) and their config, since these are auth-hook driven and stay as edge functions.
- Copy the MCP tool endpoints (profile, membership, plan listing) as-is.

## Step 4 — Keys and final checks

- I will request the Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`), the MSG91 SMS keys (`MSG91_AUTHKEY`, `MSG91_TEMPLATE_ID`), and the SMS hook secret through the secure secrets form when the code is in place. Payments and phone login stay dormant until they are set — the rest of the site works.
- In your Supabase dashboard you will need to enable phone sign-in and register the SMS hook, and in Razorpay point the webhook at this project's URL. I will give you the exact URLs.
- Verify every page renders, run a build, and confirm page titles and social preview tags carry over per page.

## Technical notes

- The copy stays on this project's TanStack Start template: routes under `src/routes`, server logic in `createServerFn` files under `src/lib`, public webhooks under `src/routes/api/public/hooks`.
- Migrations are copied verbatim, but the source has two overlapping migrations creating the same tables/types; I will apply the consolidated end state so it runs cleanly on a fresh database.
- Auth users cannot be migrated by me; your Supabase project starts with no users.
- The original project keeps running untouched — nothing I do here writes back to it.
