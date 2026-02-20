'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons, PlannerIcon } from '@/components/Icons';
import { useAuth } from '@/contexts/AuthContext';

type SymptomScore = 0 | 1 | 2 | 3;

type EnvData = {
  aqi: number | null;
  pollen: number | null;
  pm25: number | null;
  uvIndex: number | null;
  tempF: number | null;
  humidity: number | null;
  windSpeed: number | null;
};

type PlannerRec = {
  iconKey: string;
  title: string;
  description: string;
};

type LogSummary = { rescue_used: boolean; log_date: string }[];

function getAqiLabel(aqi: number): { text: string; className: string } {
  if (aqi <= 50) return { text: 'Good', className: 'text-green-500' };
  if (aqi <= 100) return { text: 'Moderate', className: 'text-amber-500' };
  if (aqi <= 150) return { text: 'Unhealthy for sensitive', className: 'text-orange-500' };
  return { text: 'Unhealthy', className: 'text-red-500' };
}

function getPollenLabel(pollen: number): string {
  if (pollen <= 10) return 'Low';
  if (pollen <= 50) return 'Moderate';
  return 'High';
}

export default function HomePage() {
  const [symptomScore, setSymptomScore] = useState<SymptomScore | null>(null);
  const [rescueUsed, setRescueUsed] = useState(false);
  const [rescuePuffs, setRescuePuffs] = useState<number | ''>('');
  const [controllerTaken, setControllerTaken] = useState(false);
  const [nightCough, setNightCough] = useState(false);
  const [exercised, setExercised] = useState(false);
  const [sick, setSick] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showZones, setShowZones] = useState(false);

  const [locationDenied, setLocationDenied] = useState(false);
  const [envLoading, setEnvLoading] = useState(true);
  const [env, setEnv] = useState<EnvData>({
    aqi: null,
    pollen: null,
    pm25: null,
    uvIndex: null,
    tempF: null,
    humidity: null,
    windSpeed: null,
  });

  const [plannerLoading, setPlannerLoading] = useState(true);
  const [plannerRecs, setPlannerRecs] = useState<PlannerRec[]>([]);
  const [logsForRescue, setLogsForRescue] = useState<LogSummary>([]);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setEnvLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const [airRes, weatherRes] = await Promise.all([
            fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,grass_pollen,pm2_5,uv_index`
            ),
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&temperature_unit=fahrenheit`
            ),
          ]);
          const air = await airRes.json();
          const weather = await weatherRes.json();
          const cur = air?.current ?? {};
          const wCur = weather?.current ?? {};
          setEnv({
            aqi: cur.us_aqi ?? null,
            pollen: cur.grass_pollen ?? null,
            pm25: cur.pm2_5 ?? null,
            uvIndex: cur.uv_index ?? null,
            tempF: wCur.temperature_2m ?? null,
            humidity: wCur.relative_humidity_2m ?? null,
            windSpeed: wCur.wind_speed_10m ?? null,
          });
        } catch {
          // keep defaults
        }
        setEnvLoading(false);
      },
      () => {
        if (!cancelled) {
          setLocationDenied(true);
          setEnvLoading(false);
        }
      },
      { timeout: 5000 }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetch('/api/logs')
      .then((r) => r.json())
      .then((data) => {
        if (data.logs && Array.isArray(data.logs)) {
          setLogsForRescue(
            data.logs.map((l: { rescue_used: boolean; log_date: string }) => ({
              rescue_used: l.rescue_used,
              log_date: l.log_date,
            }))
          );
        }
      })
      .catch(() => {});
  }, [message]);

  const daysSinceRescue = (() => {
    for (let i = 0; i < logsForRescue.length; i++) {
      if (logsForRescue[i].rescue_used) return i;
    }
    return logsForRescue.length;
  })();

  useEffect(() => {
    if (envLoading) return;
    const aqi = env.aqi != null ? String(env.aqi) : '';
    const pollen = env.pollen != null ? String(env.pollen) : '';
    fetch(`/api/planner?aqi=${aqi}&pollen=${pollen}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.recommendations) setPlannerRecs(data.recommendations);
      })
      .catch(() => {})
      .finally(() => setPlannerLoading(false));
  }, [envLoading, env.aqi, env.pollen]);

  const handleSave = async () => {
    if (symptomScore === null) {
      setMessage('Select how your breathing is today.');
      return;
    }
    setSaving(true);
    setMessage(null);
    let latitude = null;
    let longitude = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // skip
    }
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logDate: new Date().toISOString().slice(0, 10),
        symptomScore,
        rescueUsed,
        rescuePuffs: rescueUsed && rescuePuffs !== '' ? Number(rescuePuffs) : null,
        controllerTaken,
        nightCough,
        exercised,
        sick,
        latitude,
        longitude,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        setMessage('Sign in to save');
        return;
      }
      setMessage(data.error || 'Error saving log');
    } else {
      setMessage('Saved');
    }
    setSaving(false);
  };

  const scoreOptions: {
    value: SymptomScore;
    label: string;
    Icon: typeof Icons.Smile;
    activeClass: string;
  }[] = [
    { value: 0, label: 'Great', Icon: Icons.Smile, activeClass: 'border-green-500 bg-green-50 text-green-700' },
    { value: 1, label: 'A bit off', Icon: Icons.SmileNeutral, activeClass: 'border-amber-500 bg-amber-50 text-amber-700' },
    { value: 2, label: 'Bad', Icon: Icons.SmileSad, activeClass: 'border-orange-500 bg-orange-50 text-orange-700' },
    { value: 3, label: 'Really bad', Icon: Icons.SmileNone, activeClass: 'border-red-500 bg-red-50 text-red-700' },
  ];

  const today = new Date();
  const greeting =
    today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const summaryParts: string[] = [];
  if (env.aqi != null) {
    const { text } = getAqiLabel(env.aqi);
    summaryParts.push(`${text} AQI`);
  }
  if (env.pollen != null) {
    summaryParts.push(`${getPollenLabel(env.pollen)} Pollen`);
  }
  if (env.tempF != null) {
    summaryParts.push(`${Math.round(env.tempF)}°F`);
  }
  const summaryLine =
    summaryParts.length > 0 ? summaryParts.join(' · ') : 'Enable location for today\'s conditions.';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full max-w-md mx-auto px-4 py-6 pb-8">
        <header className="mb-6 flex items-center gap-3">
          <Icons.Sun className="w-8 h-8 text-slate-400" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-2xl text-slate-900">{greeting}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{dateStr}</p>
          </div>
          {!user && (
            <Link
              href="/login?next=/"
              className="shrink-0 py-2 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium"
            >
              Sign in
            </Link>
          )}
        </header>

        {/* Days since rescue — only show when meaningful */}
        {logsForRescue.length > 0 && daysSinceRescue > 0 && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 mb-4 flex items-center gap-3">
            <Icons.Trending className="w-6 h-6 text-green-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Rescue-free streak
              </p>
              <p className="text-lg font-bold text-slate-900">
                {daysSinceRescue} day{daysSinceRescue !== 1 ? 's' : ''} since last rescue use
              </p>
            </div>
          </div>
        )}

        {/* Environment card */}
        <section className="mb-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            {envLoading && (
              <div className="animate-pulse bg-slate-100 rounded-2xl h-28 flex items-center justify-center">
                <Icons.Loadbar className="w-8 h-8 text-slate-300" />
              </div>
            )}
            {!envLoading && locationDenied && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Icons.Info className="w-4 h-4 shrink-0" />
                Enable location for air quality data.
              </p>
            )}
            {!envLoading && !locationDenied && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  {env.aqi != null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AQI</p>
                      <p className={`font-semibold ${getAqiLabel(env.aqi).className}`}>
                        {env.aqi} — {getAqiLabel(env.aqi).text}
                      </p>
                    </div>
                  )}
                  {env.pollen != null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pollen</p>
                      <p className="text-slate-700 font-medium">{getPollenLabel(env.pollen)}</p>
                    </div>
                  )}
                  {env.pm25 != null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">PM2.5</p>
                      <p className="text-slate-700">{Math.round(env.pm25)}</p>
                    </div>
                  )}
                  {env.uvIndex != null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">UV Index</p>
                      <p className="text-slate-700">{env.uvIndex}</p>
                    </div>
                  )}
                  {env.tempF != null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Temp</p>
                      <p className="text-slate-700">{Math.round(env.tempF)}°F</p>
                    </div>
                  )}
                  {env.humidity != null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Humidity</p>
                      <p className="text-slate-700">{env.humidity}%</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 border-t border-slate-100 pt-3">
                  {summaryLine}
                </p>
              </>
            )}
          </div>
        </section>

        {/* Asthma zones — compact collapsible */}
        <section className="mb-4">
          <button
            type="button"
            onClick={() => setShowZones(!showZones)}
            className="w-full rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-slate-700">Know your asthma zones</span>
            <Icons.Info className={`w-5 h-5 text-slate-400 transition-transform ${showZones ? 'rotate-180' : ''}`} />
          </button>
          {showZones && (
            <div className="mt-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 space-y-3">
              <div className="flex gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Green — Doing well</p>
                  <p className="text-xs text-slate-500">No symptoms. Keep taking your controller as prescribed.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Yellow — Caution</p>
                  <p className="text-xs text-slate-500">Follow your action plan. Use rescue if needed.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Red — Get help</p>
                  <p className="text-xs text-slate-500">Use rescue and seek care if not improving quickly.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Your Plan for Today */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Your plan for today
          </h2>
          {plannerLoading && (
            <div className="space-y-2">
              <div className="animate-pulse bg-slate-100 rounded-2xl h-20" />
              <div className="animate-pulse bg-slate-100 rounded-2xl h-20" />
            </div>
          )}
          {!plannerLoading && plannerRecs.length === 0 && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <p className="text-sm text-slate-500">Log a few days to get personalized tips here.</p>
            </div>
          )}
          {!plannerLoading && plannerRecs.length > 0 && (
            <div className="space-y-3">
              {plannerRecs.map((rec, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <PlannerIcon iconKey={rec.iconKey} className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{rec.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How's your breathing — symptom grid */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            How&apos;s your breathing?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {scoreOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSymptomScore(opt.value)}
                className={`rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] flex flex-col items-center gap-2 ${
                  symptomScore === opt.value
                    ? opt.activeClass
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <opt.Icon className={`w-8 h-8 shrink-0 ${symptomScore === opt.value ? '' : 'text-slate-400'}`} />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Controller + Rescue + context toggles */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 space-y-5 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={controllerTaken}
              onChange={(e) => setControllerTaken(e.target.checked)}
              className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
            />
            <Icons.Pill className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600">Took controller inhaler today</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rescueUsed}
              onChange={(e) => setRescueUsed(e.target.checked)}
              className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
            />
            <Icons.ArrowTopRight className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600">Used rescue inhaler</span>
          </label>
          {rescueUsed && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Number of puffs
              </p>
              <input
                type="number"
                min={1}
                max={20}
                value={rescuePuffs}
                onChange={(e) =>
                  setRescuePuffs(
                    e.target.value === '' ? '' : Math.min(20, Math.max(0, Number(e.target.value)))
                  )
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. 2"
              />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Context</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Night cough', value: nightCough, set: setNightCough, Icon: Icons.Moon },
                { label: 'Exercised', value: exercised, set: setExercised, Icon: Icons.Gym },
                { label: 'Sick', value: sick, set: setSick, Icon: Icons.Heart },
              ].map(({ label, value, set, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => set(!value)}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    value ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <p
              className={`text-sm font-medium flex items-center gap-2 ${
                message === 'Saved' ? 'text-green-500' : message === 'Sign in to save' ? 'text-slate-600' : 'text-red-500'
              }`}
            >
              {message === 'Saved' && <Icons.Check className="w-4 h-4" />}
              {message === 'Sign in to save' ? (
                <Link href="/login?next=/" className="text-blue-500 underline">Sign in to save your log</Link>
              ) : (
                message
              )}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold text-base active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? 'Saving…' : 'Save today\'s log'}
          </button>
        </div>
      </div>
    </main>
  );
}
