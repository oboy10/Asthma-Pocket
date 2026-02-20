'use client';

import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <h1 className="font-bold text-2xl text-slate-900 mb-6">Settings</h1>

        {/* Account */}
        <section className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Account</h2>
          {loading ? (
            <div className="animate-pulse h-12 rounded-xl bg-slate-100" />
          ) : user ? (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                <p className="text-xs text-slate-500">Signed in</p>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="shrink-0 py-2.5 px-4 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-medium hover:border-slate-300"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-600">Sign in to save and sync your logs across devices.</p>
              <Link
                href="/login?next=/settings"
                className="inline-flex items-center justify-center py-3 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium"
              >
                Sign in
              </Link>
            </div>
          )}
        </section>

        {/* App */}
        <section className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">App</h2>
          <p className="text-sm text-slate-600">
            AsthmaPocket helps you track daily breathing, triggers, and habits. Data is stored in your account.
          </p>
        </section>

        {/* Placeholder for future */}
        <section className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Icons.Options className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Reminders & preferences</p>
              <p className="text-xs text-slate-500">Coming soon</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
