# Complete Supabase Connection & Apply Schema

## Current status
- The Supabase connector is enabled at the workspace level (visible in your screenshot).
- No Supabase connection is linked to this project yet — the "Use Supabase" button has not been activated.

## Steps

1. Click "Use Supabase" on the connector page
   - In the Lovable editor, stay on **Connectors → Supabase**.
   - Click the blue **Use Supabase** button.

2. Choose "Connect existing Supabase project"
   - Do NOT create a new Supabase project / enable Lovable Cloud.
   - Select the option to connect an existing Supabase project you already own.

3. Enter your Supabase credentials
   - Project URL: `https://<project-ref>.supabase.co`
   - Anon/Publishable key
   - Service role key (server-only, needed for admin operations)
   - Found in your Supabase dashboard under **Project Settings → API**.

4. Save the connection
   - Lovable will inject `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into the project environment.

5. Apply the database schema
   - Once the connection is saved, I will run the consolidated `ojusvi-schema.sql` against your Supabase project.
   - This creates the tables, types, RLS policies, and triggers needed by the cloned app.

6. Verify the app loads without Supabase errors
   - I will re-check the preview and confirm auth/data routes work.

## Out of scope
- Razorpay and MSG91 key collection (handled after schema is applied).
- Seeding sample data (schema only, per your request).
