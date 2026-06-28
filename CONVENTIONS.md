# FresherATS Conventions Map

## 1. Routing & Architecture
- **Framework:** Next.js (App Router)
- **Source Directory:** `src/app`
- **Route Groups:** Uses route groups like `(website)` and `(auth)` to organize UI layouts.
- **Server Actions:** Placed in `actions.ts` files adjacent to the routes that use them (e.g., `src/app/(website)/(auth)/actions.ts`).
- **Route Handlers:** API routes live in `src/app/api/`.

## 2. Imports & TypeScript
- **Alias:** `@/*` maps to `./src/*`
- **Strict Mode:** Enabled in `tsconfig.json`.

## 3. Styling & UI Components
- **Styling:** Tailwind CSS (v4) defined in `src/app/globals.css`.
- **UI Kit:** Shadcn UI components located in `src/components/ui/` (e.g., `button.tsx`).
- **Icons:** `lucide-react`.

## 4. Supabase Integration
- **Server Client:** `src/lib/supabase/server.ts` (`createServerClient`)
- **Browser Client:** `src/lib/supabase/client.ts` (`createBrowserClient`)
- **Admin/Service Client:** `src/lib/supabase/admin.ts` (`createAdminClient`)
- **Current User Fetch:** Server-side via `const { data: { user } } = await supabase.auth.getUser()`.

## 5. Authentication
- **Provider:** Supabase Auth (Email/Password).
- **Billing Attachment:** Billing records attach to `user_id` referencing `auth.users(id)`. Profile metadata is stored in `user_metadata` within Supabase Auth.

## 6. Existing Billing & Payments (CRITICAL)
- **Current Provider:** **Lemon Squeezy**, NOT Stripe.
- **Checkout:** The current pricing page (`src/app/(website)/pricing/page.tsx`) constructs Lemon Squeezy checkout URLs natively (`fresherats.lemonsqueezy.com/checkout/buy/...`).
- **Webhooks:** An existing webhook handles Lemon Squeezy events at `src/app/api/webhooks/lemonsqueezy/route.ts`.
- **Existing Schema:** There are existing `user_subscriptions` (columns: `user_id`, `tier` which can be `free`, `starter`, `pro`) and `usage_tracking` tables created via migrations.
- *Decision:* As per guardrails, since Lemon Squeezy is a Merchant of Record (handling taxes) and already implemented, we will adapt Phase 3 and the schema to use Lemon Squeezy instead of introducing Stripe.

## 7. Database Workflow
- **Migrations:** Managed via raw SQL files in the `supabase/migrations/` directory.

## 8. Environment Management
- Standard `.env.local` configuration for development. Server-only keys are kept out of `NEXT_PUBLIC_` prefixes.

## 9. Analytics
- **Provider:** Vercel Analytics (`@vercel/analytics`).
- **Event API:** Usage via the `track("event_name", { properties })` function.
