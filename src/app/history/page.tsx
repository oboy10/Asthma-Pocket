'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { useAuth } from '@/contexts/AuthContext';

type Log = {
  id: string;
  log_date: string;
  symptom_score: number;
  rescue_used: boolean;
  rescue_puffs: number | null;
  night_cough: boolean;
  exercised: boolean;
  sick: boolean;
  aqi: number | null;
  pollen_index: number | null;
};

const scoreLabel = (score: number) => {
  const labels = ['Great', 'A bit off', 'Bad', 'Really bad'];
  return labels[score] ?? 'Unknown';
};

const scoreColor = (score: number) => {
  const colors = [
    'bg-green-100 text-green-800',
    'bg-amber-100 text-amber-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
  ];
  return colors[score] ?? 'bg-slate-100 text-slate-800';
};

const scoreDotColor = (score: number) => {
  const colors = ['bg-green-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
  return colors[score] ?? 'bg-slate-300';
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const last7 = logs.slice(0, 7);
  const reversed7 = [...last7].reverse();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-2xl text-slate-900">History</h1>
          <Link
            href="/"
            className="text-sm font-medium text-blue-500 flex items-center gap-1.5"
          >
            <Icons.Add className="w-4 h-4" />
            Log today
          </Link>
        </div>

        {/* 7-day symptom dot strip */}
        {!loading && logs.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Last 7 days
            </p>
            <div className="flex justify-between items-end gap-1">
              {reversed7.map((log, i) => (
                <div key={log.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full ${scoreDotColor(log.symptom_score)} transition-all`}
                    title={`${new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short' })}: ${scoreLabel(log.symptom_score)}`}
                  />
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <div className="animate-pulse bg-slate-100 rounded-2xl h-24" />
            <div className="animate-pulse bg-slate-100 rounded-2xl h-24" />
            <div className="animate-pulse bg-slate-100 rounded-2xl h-24" />
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Icons.Notes className="w-7 h-7 text-slate-400" />
            </div>
            {!user ? (
              <>
                <p className="text-sm text-slate-600">Sign in to see your history.</p>
                <p className="text-sm text-slate-500 mt-1">Your logs will sync across devices.</p>
                <Link
                  href="/login?next=/history"
                  className="inline-flex items-center gap-2 mt-4 py-3 px-6 rounded-2xl bg-blue-500 text-white font-bold text-sm active:scale-[0.98] transition-all"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">No logs yet.</p>
                <p className="text-sm text-slate-500 mt-1">Go log your first day on Today.</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 mt-4 py-3 px-6 rounded-2xl bg-blue-500 text-white font-bold text-sm active:scale-[0.98] transition-all"
                >
                  <Icons.Add className="w-4 h-4" />
                  Log today
                </Link>
              </>
            )}
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(log.log_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${scoreColor(
                      log.symptom_score
                    )}`}
                  >
                    {scoreLabel(log.symptom_score)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 items-center">
                  {log.rescue_used && (
                    <span className="flex items-center gap-1">
                      <Icons.ArrowTopRight className="w-3.5 h-3.5" />
                      Rescue{log.rescue_puffs ? ` (${log.rescue_puffs} puffs)` : ''}
                    </span>
                  )}
                  {log.night_cough && (
                    <span className="flex items-center gap-1"><Icons.Moon className="w-3.5 h-3.5" /> Night cough</span>
                  )}
                  {log.exercised && (
                    <span className="flex items-center gap-1"><Icons.Gym className="w-3.5 h-3.5" /> Exercised</span>
                  )}
                  {log.sick && (
                    <span className="flex items-center gap-1"><Icons.Heart className="w-3.5 h-3.5" /> Sick</span>
                  )}
                  {log.aqi !== null && (
                    <span className="flex items-center gap-1"><Icons.Cloud className="w-3.5 h-3.5" /> AQI {log.aqi}</span>
                  )}
                  {log.pollen_index !== null && (
                    <span className="flex items-center gap-1"><Icons.Trees className="w-3.5 h-3.5" /> Pollen {log.pollen_index}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
