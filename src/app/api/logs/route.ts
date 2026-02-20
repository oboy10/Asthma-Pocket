import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function fetchAQI(lat: number, lon: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`
    );
    const data = await res.json();
    return data?.current?.us_aqi ?? null;
  } catch {
    return null;
  }
}

async function fetchPollen(lat: number, lon: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=grass_pollen`
    );
    const data = await res.json();
    return data?.current?.grass_pollen ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to save your log' }, { status: 401 });
    }

    const body = await req.json();
    const {
      logDate,
      symptomScore,
      rescueUsed,
      rescuePuffs,
      nightCough,
      exercised,
      sick,
      controllerTaken,
      latitude,
      longitude,
    } = body;

    let aqi = null;
    let pollen_index = null;

    if (latitude && longitude) {
      [aqi, pollen_index] = await Promise.all([
        fetchAQI(latitude, longitude),
        fetchPollen(latitude, longitude),
      ]);
    }

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      log_date: logDate,
      symptom_score: symptomScore,
      rescue_used: rescueUsed,
      rescue_puffs: rescueUsed ? rescuePuffs : null,
      night_cough: nightCough,
      exercised,
      sick,
      aqi,
      pollen_index,
      latitude,
      longitude,
    };
    if (typeof controllerTaken === 'boolean') {
      insertPayload.controller_taken = controllerTaken;
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ log: data }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ logs: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ logs: data ?? [] }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
