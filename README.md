# GoldCut Barber Shop Booking

GoldCut is a polished booking and management web app for a barbershop. It supports client-side booking, partner shop discovery, and an owner dashboard for scheduling, service pricing, staff management, and CRM notes.

## Features

- Client booking flow for barbershops
- Shop search and browsing
- Barber and time-slot availability logic
- Owner dashboard with appointment tracking
- Service and barber management
- Shop photo upload through Supabase Storage
- Configurable shop opening days and hours
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

## Deploy

This is a static website, so it can be deployed as-is to:

- Vercel static project
- Netlify static site
- GitHub Pages

## Notes

The app is prepared for production-style deployment but still needs a final live Supabase configuration and a GitHub remote for push-based publishing.
