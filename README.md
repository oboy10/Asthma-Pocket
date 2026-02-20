# AsthmaPocket

**Try it:** [asthma-pocket.vercel.app](https://asthma-pocket.vercel.app/)

---

## Why I built this

I had asthma as a kid. I remember the uncertainty—not always knowing what made a bad day worse, or what “doing well” really looked like over time. I wanted something simple: a place to log how my breathing felt each day and to see how that lined up with the air around me and my habits.

AsthmaPocket is that app. It’s a small, private tool to track your breathing day by day, see your local air quality and pollen, get a simple “plan for today,” and look back at your history and patterns. No clutter—just what helps you stay aware and in control.

---

## What it does

- **Today** — Log how your breathing is (great, a bit off, bad, or really bad), plus whether you used your rescue inhaler, had a night cough, exercised, or were sick. You also see today’s air quality (AQI), pollen, and weather, and a short “plan for today” with a few practical tips.
- **History** — A 7-day snapshot and a full list of past logs so you can spot trends.
- **Insights** — A quick look at your last two weeks: average symptoms, rescue use, what might be triggering bad days, and a simple “good days” streak.
- **Settings** — Your account (sign in with email; your data stays yours).

Everything is designed to be clear and calm: one main flow per day, with environment and plan at the top so you can make better decisions.

---

## How it’s made

AsthmaPocket is a web app built so it’s fast, works on phones and desktops, and keeps your data secure.

- **Front end:** [Next.js](https://nextjs.org) and [React](https://react.dev) with [Tailwind CSS](https://tailwindcss.com) for a clean, consistent layout. The app is responsive and works well on small screens.
- **Back end & data:** [Supabase](https://supabase.com) handles sign-in and stores your logs. Only you can see your data.
- **Environment data:** Air quality and pollen come from [Open-Meteo](https://open-meteo.com) so you can see local AQI and pollen when you allow location.

The code is organized into: **pages** (Today, History, Insights, Settings), **API routes** (saving and loading logs, and a small “planner” that turns your recent logs into daily tips), and **shared pieces** (navigation, auth, icons). No heavy frameworks—just what’s needed to keep it simple and maintainable.

---

## Making it better

I’m actively improving AsthmaPocket. Right now the focus is on:

- **Stability and polish** — Fixing bugs and smoothing out the experience on different devices and browsers.
- **Smarter tips** — Better “plan for today” suggestions based on your history and local conditions.
- **Reminders and preferences** — Optional daily reminders and settings so the app fits how you actually use it.

If you have ideas or run into issues, open an [Issue](https://github.com/oboy10/Asthma-Pocket/issues) on GitHub. I read them and use feedback to decide what to build next.

---

## For developers

### Run it locally

```bash
git clone https://github.com/oboy10/Asthma-Pocket.git
cd Asthma-Pocket
npm install
```

Copy `.env.example` to `.env.local` and add your [Supabase](https://supabase.com) project URL and anon key. Create the `daily_logs` table and enable auth (see [DEPLOY.md](./DEPLOY.md) for SQL and URL config).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy

Step-by-step: **[DEPLOY.md](./DEPLOY.md)** (GitHub → Vercel, env vars, Supabase redirect URLs).

### Scripts

- `npm run dev` — dev server  
- `npm run build` — production build  
- `npm run start` — run production build locally  
- `npm run lint` — ESLint  

---

**[Open AsthmaPocket →](https://asthma-pocket.vercel.app/)**
