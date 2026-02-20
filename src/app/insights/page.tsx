'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { useAuth } from '@/contexts/AuthContext';

type Log = {
  log_date: string;
  symptom_score: number;
  rescue_used: boolean;
  aqi: number | null;
  pollen_index: number | null;
  exercised: boolean;
  sick: boolean;
};

export default function InsightsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs')
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  const last14 = logs.slice(0, 14);
  const n = last14.length;

  const avgScore =
    n > 0 ? last14.reduce((s, r) => s + r.symptom_score, 0) / n : null;
  const rescueCount = last14.filter((r) => r.rescue_used).length;
  const badDays = last14.filter((r) => r.symptom_score >= 2);
  const badWithHighAqi = badDays.filter((r) => r.aqi != null && r.aqi > 100).length;
  const badWithHighPollen = badDays.filter(
    (r) => r.pollen_index != null && r.pollen_index > 50
  ).length;
  const badWithExercise = badDays.filter((r) => r.exercised).length;
  const badWithSick = badDays.filter((r) => r.sick).length;

  const triggers = [
    { name: 'High AQI', count: badWithHighAqi },
    { name: 'High pollen', count: badWithHighPollen },
    { name: 'Exercise', count: badWithExercise },
    { name: 'Sick', count: badWithSick },
  ].filter((t) => t.count > 0);
  triggers.sort((a, b) => b.count - a.count);
  const topTrigger = triggers[0];

  let streak = 0;
  for (const r of last14) {
    if (r.symptom_score <= 1) streak++;
    else break;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="w-full max-w-md mx-auto px-4 py-6">
          <h1 className="font-bold text-2xl text-slate-900 mb-6">Insights</h1>
          <div className="space-y-4">
            <div className="animate-pulse bg-slate-100 rounded-2xl h-28" />
            <div className="animate-pulse bg-slate-100 rounded-2xl h-28" />
            <div className="animate-pulse bg-slate-100 rounded-2xl h-28" />
          </div>
        </div>
      </main>
    );
  }

  if (n === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="w-full max-w-md mx-auto px-4 py-6">
          <h1 className="font-bold text-2xl text-slate-900 mb-6">Insights</h1>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Icons.Chart className="w-7 h-7 text-slate-400" />
            </div>
            {!user ? (
              <>
                <p className="text-sm text-slate-600">Sign in to see your insights.</p>
                <p className="text-sm text-slate-500 mt-1">We&apos;ll analyze your logs and triggers.</p>
                <Link
                  href="/login?next=/insights"
                  className="inline-flex items-center gap-2 mt-4 py-3 px-6 rounded-2xl bg-blue-500 text-white font-bold text-sm"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-600">Log at least a few days to see insights.</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <h1 className="font-bold text-2xl text-slate-900 mb-6">Insights</h1>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icons.Chart className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="font-bold text-slate-900">Your week at a glance</h2>
            </div>
            <p className="text-sm text-slate-600">
              Average symptom score:{' '}
              <span className="font-medium text-slate-900">
                {avgScore != null ? avgScore.toFixed(1) : '—'}
              </span>
              {' · '}
              Rescue inhaler used{' '}
              <span className="font-medium text-slate-900">{rescueCount}</span>{' '}
              time{rescueCount !== 1 ? 's' : ''} in the last 14 days.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icons.Trees className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="font-bold text-slate-900">Top trigger</h2>
            </div>
            <p className="text-sm text-slate-600">
              {topTrigger ? (
                <>
                  <span className="font-medium text-slate-900">{topTrigger.name}</span> was
                  associated with {topTrigger.count} bad breathing day
                  {topTrigger.count !== 1 ? 's' : ''} in the last 14 days.
                </>
              ) : (
                <>No strong trigger pattern in your recent logs yet.</>
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icons.Trending className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="font-bold text-slate-900">Streak</h2>
            </div>
            <p className="text-sm text-slate-600">
              {streak > 0 ? (
                <>
                  <span className="font-medium text-green-500">{streak} day{streak !== 1 ? 's' : ''}</span> in a
                  row with &quot;Great&quot; or &quot;A bit off&quot; breathing. Keep it up!
                </>
              ) : (
                <>Start logging to build a streak of good breathing days.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
