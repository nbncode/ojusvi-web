# Connect Your Existing Supabase Project

## Goal
Point this Lovable project at your own Supabase instance so the cloned app can authenticate users and read/write data.

## Steps

1. Open project settings
   - In the Lovable editor, click the gear icon (Settings) in the top-right.
   - Choose **Connectors** → **Supabase**.

2. Choose "Connect existing Supabase project"
   - Do NOT click "Create new Supabase project" / enable Lovable Cloud.
   - Select the option to connect an existing Supabase project you already own.

3. Enter your Supabase credentials
   - Project URL: `https://<project-ref>.supabase.co`
   - Anon/Publishable key
   - Service role key (server-only, needed for edge functions / admin operations)
   - These are found in your Supabase dashboard under **Project Settings → API**.

4. Save and verify
   - After saving, Lovable will inject the keys into the project environment.
   - The app will stop throwing "Missing Supabase environment variable" errors.

5. Apply the database schema
   - Once connected, open the Supabase SQL Editor in your project dashboard.
   - Paste the consolidated schema SQL (`ojusvi-schema.sql`) and run it.
   - Or tell me the connection is saved and I can apply the migrations for you.

6. Configure auth providers (if needed)
   - In your Supabase dashboard, enable Email, Google, Apple, or any provider the app uses.
   - Add the redirect/callback URLs that match your published/preview domains.

## Out of scope for this plan
- Razorpay and MSG91 key collection (next step after schema is applied).
- Seeding sample data (user requested schema only).
