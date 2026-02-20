import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type LogRow = {
  log_date: string;
  symptom_score: number;
  rescue_used: boolean;
  aqi: number | null;
  pollen_index: number | null;
  exercised: boolean;
  sick: boolean;
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ recommendations: [] }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const todayAqi = searchParams.get('aqi') ? Number(searchParams.get('aqi')) : null;
    const todayPollen = searchParams.get('pollen') ? Number(searchParams.get('pollen')) : null;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('log_date, symptom_score, rescue_used, aqi, pollen_index, exercised, sick')
      .eq('user_id', user.id)
      .gte('log_date', cutoffStr)
      .order('log_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const rows = (logs ?? []) as LogRow[];
    const recommendations: { iconKey: string; title: string; description: string }[] = [];

    const n = rows.length;
    if (n === 0) {
      recommendations.push({
        iconKey: 'start',
        title: 'Start logging',
        description: 'Log your breathing for a few days to get personalized tips here.',
      });
      return NextResponse.json({ recommendations }, { status: 200 });
    }

    const avgScore = rows.reduce((s, r) => s + r.symptom_score, 0) / n;
    const badDays = rows.filter((r) => r.symptom_score >= 2);
    const rescueCount = rows.filter((r) => r.rescue_used).length;
    const rescueFreeDays = rows
      .slice()
      .sort((a, b) => b.log_date.localeCompare(a.log_date));
    let rescueStreak = 0;
    for (const r of rescueFreeDays) {
      if (r.rescue_used) break;
      rescueStreak++;
    }

    const badWithHighAqi = badDays.filter((r) => r.aqi != null && r.aqi > 100).length;
    const badWithHighPollen = badDays.filter((r) => r.pollen_index != null && r.pollen_index > 50).length;
    const badWithExercise = badDays.filter((r) => r.exercised).length;
    const badWithSick = badDays.filter((r) => r.sick).length;

    if (todayPollen != null && todayPollen > 50) {
      recommendations.push({
        iconKey: 'pollen',
        title: 'High pollen today',
        description: 'Consider taking your controller inhaler before going outside.',
      });
    }

    if (todayAqi != null && todayAqi > 100) {
      recommendations.push({
        iconKey: 'aqi',
        title: 'Air quality is poor',
        description: 'Limit time outdoors and keep windows closed if possible.',
      });
    }

    if (todayAqi != null && todayAqi <= 50 && todayPollen != null && todayPollen <= 10) {
      recommendations.push({
        iconKey: 'sun',
        title: 'Great conditions',
        description: 'AQI and pollen are low — good day for outdoor activity.',
      });
    }

    if (badDays.length >= 3 && avgScore >= 1.5) {
      recommendations.push({
        iconKey: 'lungs',
        title: 'Take it easy',
        description: "You've had several rough breathing days — light exercise only today.",
      });
    }

    if (rescueStreak >= 5) {
      recommendations.push({
        iconKey: 'streak',
        title: 'Rescue-free streak',
        description: `You haven't used your rescue inhaler in ${rescueStreak} days — keep it up!`,
      });
    }

    if (rescueCount >= 3 && n >= 7) {
      recommendations.push({
        iconKey: 'tip',
        title: 'Rescue use this period',
        description: 'You used your rescue inhaler several times — consider talking to your doctor if this continues.',
      });
    }

    const triggers = [
      { name: 'High AQI', count: badWithHighAqi },
      { name: 'High pollen', count: badWithHighPollen },
      { name: 'Exercise', count: badWithExercise },
      { name: 'Sick', count: badWithSick },
    ].filter((t) => t.count > 0);
    triggers.sort((a, b) => b.count - a.count);
    if (triggers.length > 0 && recommendations.length < 4) {
      const top = triggers[0];
      if (top.count >= 2) {
        recommendations.push({
          iconKey: 'trigger',
          title: `"${top.name}" often links to bad days`,
          description: `On ${top.count} bad days you had this factor — something to watch today.`,
        });
      }
    }

    const unique = recommendations.slice(0, 4);
    return NextResponse.json({ recommendations: unique }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
