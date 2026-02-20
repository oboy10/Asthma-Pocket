# AsthmaPocket

A minimalistic asthma tracking app: daily breathing logs, environment (AQI/pollen), personalized plan, and insights. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Today**: Environment card (AQI, pollen, weather), asthma zones, daily plan tips, symptom logging, rescue/controller tracking
- **History**: 7-day strip and full log list
- **Insights**: Week summary, top trigger, streak
- **Settings**: Account, sign out
- **Auth**: Sign in / sign up (email + password or magic link). Logs are stored per user.

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - In **SQL Editor**, create the table (if not already):

   ```sql
   create table if not exists daily_logs (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) on delete cascade not null,
     log_date date not null,
     symptom_score smallint not null check (symptom_score between 0 and 3),
     rescue_used boolean not null default false,
     rescue_puffs smallint,
     night_cough boolean not null default false,
     exercised boolean not null default false,
     sick boolean not null default false,
     controller_taken boolean,
     aqi smallint,
     pollen_index smallint,
     latitude double precision,
     longitude double precision,
     created_at timestamptz default now()
   );

   alter table daily_logs enable row level security;

   create policy "Users can manage own logs"
     on daily_logs for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

   - In **Authentication → URL Configuration**, add your site URL and redirect URLs (e.g. `http://localhost:3000`, `https://your-app.vercel.app`, `https://your-app.vercel.app/auth/callback`).

3. **Environment variables**

   Copy `.env.example` to `.env.local` and set:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL (Supabase Dashboard → Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

**Step-by-step:** See **[DEPLOY.md](./DEPLOY.md)** for a full walkthrough (GitHub → Vercel + Supabase redirect URLs).

Summary:
1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. In the Vercel project, go to **Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL**: `https://your-vercel-domain.vercel.app`
   - **Redirect URLs**: add `https://your-vercel-domain.vercel.app/auth/callback`
4. Deploy. After the first deploy, confirm the production URL and add it (and its `/auth/callback`) to Supabase redirect URLs if different.

## Scripts

- `npm run dev` — start dev server (webpack)
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
