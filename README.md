# FOCO Barber Shop Booking

FOCO is a polished booking and management web app for a barbershop. It supports client-side booking, partner shop discovery, and an owner dashboard for scheduling, service pricing, staff management, and CRM notes.

## Features

- Client booking flow for barbershops
- Shop search and browsing
- Barber and time-slot availability logic
- Owner dashboard with appointment tracking
- Service and barber management
- Shop photo upload through Supabase Storage
- Configurable shop opening days and hours
- Owner-controlled open/closed shop status
- Guinea-Bissau localization: FCFA pricing, +245 phone validation, WhatsApp, and payment methods
- Offline connectivity banner and mobile-money payment tracking
- CRM notes for client preferences and allergies
- Supabase authentication and database integration
- Local persistence for client-side favorites and appointment references

## Tech stack

- HTML5, Tailwind CSS
- Vanilla JavaScript
- Supabase for auth and PostgreSQL data
- Static hosting compatible with Netlify, Vercel, or GitHub Pages

## Local run

Open `index.html` directly in a browser, or serve the folder with a static server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Supabase setup

1. Create a Supabase project.
2. Add your project URL and anon/public key in the app config.
3. Run the provided SQL schema and RPC migrations in Supabase.
4. Confirm the `shops`, `services`, `barbers`, `appointments`, and `clients` tables exist and RLS policies are applied.
5. Confirm the public `shop-images` Storage bucket exists for barbershop photos.
6. Confirm the `shops.open_days`, `shops.opening_time`, and `shops.closing_time` fields exist for shop schedules.
7. Confirm the `shops.is_open` field exists for the client-facing shop status.
8. Confirm the `shops.description`, `shops.phone`, `shops.whatsapp`, `shops.accepts_cash`, and `shops.accepts_mobile_money` fields exist.
9. Confirm appointments contain `payment_method` and `payment_status`, and the `set_appointment_payment` RPC is available.
10. Apply `supabase/migrations/20261124161920_cascade_account_deletion.sql`.
11. Deploy the `delete-account` Edge Function with `supabase functions deploy delete-account --project-ref <project-ref>`.
12. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Configure it as a Supabase Edge Function secret (for example with `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... --project-ref <project-ref>`); never place it in browser code or a public Vercel environment variable.

The current schema has no separate owner-profile or queue table. Account deletion removes the owner's `shops` rows, which cascade to barbers, services, clients, and appointments. Shop images are uploaded under the owner UUID in the `shop-images` bucket and are removed by the Edge Function before deleting the auth user.

## Deploy

This is a static website, so it can be deployed as-is to:

- Vercel static project
- Netlify static site
- GitHub Pages

## Notes

The app is prepared for production-style deployment but still needs a final live Supabase configuration and a GitHub remote for push-based publishing.
