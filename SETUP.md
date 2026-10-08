# Ќебапчилница Вучко — Setup & Deployment Guide

Full reproducible setup for the Supabase database, linking, local dev, and
Vercel deployment. No manual dashboard setup needed — everything is in
version-controlled migrations.

---

## 0. Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) — install one of:
  ```bash
  npm install -g supabase
  # or
  scoop install supabase       # Windows
  brew install supabase/tap/supabase  # macOS
  ```
- Docker Desktop (required for `supabase start` — local dev DB)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account

---

## 1. Install project dependencies

```bash
cd path/to/Vucko
npm install
```

---

## 2. Create a Supabase project (once)

1. Go to <https://supabase.com/dashboard> → **New Project**.
2. Name it `vucko-rostuse`, pick the closest region, **set a strong DB password**
   (save it somewhere — you can reset it later in Dashboard → Settings → Database).
3. Wait ~2 min for the project to finish provisioning.

> ⚠️ Do **NOT** create tables/policies through the dashboard.  We'll push
> migrations from the repo.

---

## 3. Login & link the local project to Supabase

### 3.1 Login to Supabase CLI

```bash
npm run login
# your browser opens → authenticate → return to terminal
```

### 3.2 Find your Project Reference (12-char slug)

- Open your project → **Project Settings** (cog, bottom-left) → **General**
- Copy the **Reference ID** (looks like `ab12cd34ef56gh`)

### 3.3 Link the repo to this project

```bash
# replace ab12cd34ef56gh with YOUR project ref
npm run link -- ab12cd34ef56gh
```

You'll be prompted for the DB password you set in step 2.
On success the file `supabase/.temp` and a `config.toml` `project_id` are updated.

---

## 4. Configure environment variables

Copy the example env file and fill in the values:

```bash
copy .env.example .env.local
```

Open `.env.local` and fill:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://ab12cd34ef56gh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (OPTIONAL, server-side only)
```

**Where to get these** — in Supabase dashboard:
- **Project Settings → API**
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe for browsers)
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**SECRET**, never expose)

> Note: The anon key is designed to be public — RLS policies enforce security.

---

## 5. Push migrations + seed to the remote Supabase database

This creates **everything** — tables, views, RLS policies, indexes, triggers,
realtime publication, initial products, restaurant settings, and opening hours.

```bash
npm run db:push
```

If the remote DB already has objects and you want a clean slate:

```bash
# wipe remote DB and re-apply all migrations from scratch
# NOTE: this DELETES all existing data in Supabase
npm run db:reset
```

### Verify in the dashboard

Go to Supabase → **Table Editor** — you should see these tables populated:
- `products` (19 initial Vučko products, 4 featured)
- `orders` (empty)
- `order_items` (empty)
- `restaurant_settings` (1 row: id=`main`, phone=`078-495-591`, email=`ahmedidelil0@gmail.com`)
- `opening_hours` (7 rows, Sun closed, 08:00–22:00 rest)

Also check:
- **Authentication → Policies** — RLS enabled on every table
- **Database → Replication** → `supabase_realtime` publication has `orders`,
  `order_items`, `products`, `restaurant_settings`, `opening_hours`

---

## 6. Create the admin login (once)

You log in **with Supabase Auth**, not a custom users table.

Use this email (matches your requested contact info):
- **Email:** `ahmedidelil0@gmail.com`
- **Password:** pick a **strong password** (min 6 chars, ideally 12+ with mix)

Create the user via **either** method:

### Method A — Supabase Dashboard (easiest)

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: `ahmedidelil0@gmail.com`
3. Check **Auto-confirm user** (so no confirmation email is needed)
4. Enter password → **Create user**

### Method B — Via login page with invite

1. Run `npm run dev`
2. Visit `/login` and click forgot password (not great for first user)
3. Or use the dashboard method above — it's cleaner.

### To reset password later

Supabase → **Authentication → Users** → ⋯ next to the user → **Reset password**.

---

## 7. Local development

### Option 1 — Use the *real remote* Supabase (simplest, recommended)

Just run:

```bash
npm run dev
```

Open <http://localhost:3000>. Data comes straight from your Supabase project.
Log in at <http://localhost:3000/login> with the credentials you just created.

### Option 2 — Use a *local* Docker-based Supabase (full offline parity)

Requires Docker Desktop running.

```bash
# Spin up full local Supabase (DB, Auth, Storage, Studio, Realtime)
npm run db:start
```

When it finishes, it prints:
- **API URL**: `http://127.0.0.1:54321`
- **Anon key**: `eyJhbGciOi…` (a long JWT)
- **Studio**: `http://127.0.0.1:54323`

Update `.env.local` to point at local:

```ini
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the-anon-key-printed-by-supabase-start>
```

Now `npm run dev` uses the local DB. Migrations are auto-applied on start.
To also run seed: `npm run db:seed`.

To shut down local Supabase:

```bash
npm run db:stop     # keeps DB data
# or
npm run db:stop -- --no-backup   # wipe everything
```

---

## 8. Migrations workflow (for future changes)

The golden rule: **never modify tables/policies in the dashboard**.  Always
write a migration.

```bash
# 1. Make a schema change on your LOCAL supabase (via Supabase Studio at localhost:54323)
# 2. Auto-generate a diff as a new migration file:
npm run db:diff -- new_column_on_products

# 3. The new file is created in supabase/migrations/ — review it.

# 4. Apply locally (runs all unapplied migrations):
npm run db:reset

# 5. Commit + push. Any teammate pulling the repo gets the change via migration.

# 6. Push the change to the live Supabase project:
npm run db:push
```

To pull the *current state* of the REMOTE database into a migration (e.g. if
someone modified things in the dashboard — try to avoid this):

```bash
npm run db:pull
```

---

## 9. Deploy to Vercel

### 9.1 Push your code to GitHub/GitLab/Bitbucket

### 9.2 Import project in Vercel

1. Vercel → **Add New → Project** → import your repo.
2. **Framework Preset:** Next.js (auto-detected).
3. **Root Directory:** leave as `/`.
4. Open **Environment Variables** section.

### 9.3 Set Vercel environment variables

Add **exactly these** 2 — they're public and safe:

| Name                           | Value                                            | Environment       |
| ------------------------------ | -------------------------------------------------| ----------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | `https://ab12cd34ef56gh.supabase.co`             | Production + Preview + Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| `eyJhbGciOi………` (the anon key, NOT service_role) | Production + Preview + Development |

Optional (only if you later use server-side admin features):

| Name                     | Value (SECRET)                       |
| ------------------------ | ------------------------------------ |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci……` (service_role key)    |

> ⚠️ **NEVER** put the `service_role` key in a `NEXT_PUBLIC_*` variable — those
> are sent to every visitor's browser. Keep it unprefixed for server-only use.

### 9.4 Deploy

Click **Deploy**. Vercel builds and publishes your site.
When finished it gives you a URL like `https://vucko-rostuse.vercel.app`.

### 9.5 Add custom domain (optional)

Vercel → Project → **Settings → Domains** → add your domain, follow the DNS
instructions.

---

## 10. Supabase Auth: allow redirects to your Vercel domain

Supabase by default only allows `localhost` redirects.  For your deployed app
to work you must whitelist the domain:

1. Supabase → **Authentication → URL Configuration**
2. Add each of these (one per line) into **Additional redirect URLs**:
   ```
   https://vucko-rostuse.vercel.app/**
   https://your-custom-domain.com/**
   http://localhost:3000/**
   ```
3. In **Site URL** put your primary URL, e.g. `https://vucko-rostuse.vercel.app`

---

## 11. Quick-reference script cheat sheet

```bash
# Dependencies
npm install

# App
npm run dev          # start next dev server
npm run build        # production build
npm run start        # run built app
npm run lint         # lint code

# Supabase local (requires Docker)
npm run db:start     # spin up local Supabase stack
npm run db:stop      # shut it down
npm run db:reset     # wipe + re-apply all migrations + seed locally
npm run db:seed      # run supabase/seed.sql
npm run db:lint      # lint DB schema for best practices

# Supabase remote (requires `npm run link` first)
npm run login        # authenticate CLI with Supabase
npm run link -- REF  # link repo to a Supabase project by its 12-char ref
npm run db:push      # apply all unapplied migrations to remote
npm run db:pull      # pull remote schema changes into a new migration
npm run db:diff -- <name>  # diff local → migration file (works w/ local running)
```

---

## 12. Admin login credentials — production

| Field    | Value                    |
| -------- | -------------------------|
| URL      | `https://your-domain/login` or `/login` on your Vercel site |
| Email    | `ahmedidelil0@gmail.com` |
| Password | *the one you created in Supabase Auth → Users* (6+ chars, not stored in the repo) |

> If you forget the password, reset it from Supabase Dashboard →
> Authentication → Users → ⋯ → Reset password.

---

## 13. Contact info baked into the DB

After migrations + seed, the `restaurant_settings` table will have:

- Phone: `078-495-591`
- Email: `ahmedidelil0@gmail.com`
- Address: `Ростуше, Северна Македонија`
- Delivery area: `Ростуше и околина`

You can edit everything from `/admin/settings` once logged in — no code
changes needed.

---

## 14. Performance & caching notes

Enabled out of the box:
- Next.js SWC minification + compression
- AVIF/WebP image formats with 7-day cache TTL
- 1-year immutable cache for `_next/static/` assets
- 30-day cache on local `/images/*`
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- ISR revalidate=30s on homepage, menu, contact (fresh data, still cached)

If you need even faster load in production: enable Vercel's
[Speed Insights](https://vercel.com/docs/speed-insights) and
[Image Optimization](https://vercel.com/docs/image-optimization) (auto-enabled
on Pro).
