# Deploy AsthmaPocket: GitHub → Vercel

Follow these steps to put your app on GitHub and deploy it to Vercel.

---

## Part 1: Push to GitHub

### 1. Commit your code locally

From the project root (`asthmapocket`):

```bash
cd /Users/okhaunte/asthmapocket

# Stage all files (env files are already ignored by .gitignore)
git add .

# Commit
git commit -m "AsthmaPocket: auth, today/history/insights/settings, Vercel-ready"
```

### 2. Create a new repo on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click the **+** (top right) → **New repository**.
3. **Repository name:** `asthmapocket` (or any name you like).
4. **Visibility:** Public (or Private if you prefer).
5. **Do not** check “Add a README” or “Add .gitignore” (you already have them).
6. Click **Create repository**.

### 3. Connect the repo and push

GitHub will show “push an existing repository from the command line.” Repo: [oboy10/Asthma-Pocket](https://github.com/oboy10/Asthma-Pocket). Run:

```bash
git remote add origin https://github.com/oboy10/Asthma-Pocket.git
git branch -M main
git push -u origin main
```

If you use SSH instead:

```bash
git remote add origin git@github.com:oboy10/Asthma-Pocket.git
git branch -M main
git push -u origin main
```

Your code is now on GitHub.

---

## Part 2: Deploy on Vercel

### 4. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub” if you can).
2. Click **Add New…** → **Project**.
3. Find **Asthma-Pocket** in the list and click **Import** (or “Import Git Repository” and paste the repo URL).

### 5. Configure environment variables

Before deploying, add your Supabase keys:

1. On the import screen, open **Environment Variables**.
2. Add:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`  
     **Value:** your Supabase project URL (e.g. `https://xxxxx.supabase.co`).
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     **Value:** your Supabase anon/public key.
3. Leave the env scope as **Production** (and add the same for Preview if you use branches).
4. Click **Deploy**.

### 6. Wait for the build

Vercel will build and deploy. When it’s done you’ll get a URL like `https://asthmapocket-xxx.vercel.app`.

### 7. Set redirect URLs in Supabase

So sign-in and magic links work on the live app:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. **Site URL:** set to your Vercel URL, e.g. `https://asthmapocket-xxx.vercel.app`.
4. **Redirect URLs:** add:
   - `https://asthmapocket-xxx.vercel.app`
   - `https://asthmapocket-xxx.vercel.app/auth/callback`
5. Save.

Use your real Vercel URL instead of `asthmapocket-xxx.vercel.app`.

---

## After deployment

- **New commits:** Push to `main`; Vercel will redeploy automatically.
- **Custom domain:** In the Vercel project, go to **Settings** → **Domains** and add your domain.
- **Env changes:** In Vercel → **Settings** → **Environment Variables**, edit or add variables and redeploy.

---

## Quick reference

| Step | Where | What |
|------|--------|------|
| 1–3 | Terminal + GitHub | Commit, create repo, push |
| 4–6 | Vercel | Import repo, add env vars, deploy |
| 7 | Supabase | Add Vercel URL and `/auth/callback` to redirect URLs |
