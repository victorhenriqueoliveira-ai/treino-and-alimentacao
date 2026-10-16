import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '../../../lib/db';

export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function weekRange(date) {
  const d = new Date(date + 'T00:00:00Z');
  const dow = (d.getUTCDay() + 6) % 7; // segunda = 0
  const start = new Date(d.getTime() - dow * 86400000);
  const end = new Date(start.getTime() + 6 * 86400000);
  const iso = (x) => x.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

export async function GET(req) {
  try {
    const date = new URL(req.url).searchParams.get('date');
    if (!date || !DATE_RE.test(date)) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
    }
    await ensureSchema();
    const s = sql();
    const { start, end } = weekRange(date);

    const [sets, meals, water, session, weekSessions, weekCardio, weights, lastKg, recent, total] =
      await Promise.all([
        s`select exercise_id, set_no, kg from set_logs where date = ${date}::date`,
        s`select meal_id from meal_checks where date = ${date}::date`,
        s`select ml from water_logs where date = ${date}::date`,
        s`select date::text as date, day_key, duration_sec from sessions where date = ${date}::date`,
        s`select date::text as date, day_key, duration_sec from sessions where date between ${start}::date and ${end}::date order by date`,
        s`select id, date::text as date, kind, minutes from cardio_logs where date between ${start}::date and ${end}::date order by date, id`,
        s`select date::text as date, kg from weight_logs order by date desc limit 30`,
        s`select distinct on (exercise_id) exercise_id, kg from set_logs where date < ${date}::date and kg is not null order by exercise_id, date desc`,
        s`select date::text as date, day_key, duration_sec from sessions order by date desc limit 10`,
        s`select count(*)::int as n from sessions`,
      ]);

    const lastKgMap = {};
    for (const r of lastKg) lastKgMap[r.exercise_id] = Number(r.kg);

    return NextResponse.json({
      date,
      weekStart: start,
      sets: sets.map((r) => ({ exercise_id: r.exercise_id, set_no: r.set_no, kg: r.kg === null ? null : Number(r.kg) })),
      meals: meals.map((r) => r.meal_id),
      waterMl: water[0]?.ml ?? 0,
      session: session[0] || null,
      week: {
        sessions: weekSessions,
        cardio: weekCardio,
      },
      weights: weights.map((r) => ({ date: r.date, kg: Number(r.kg) })).reverse(),
      lastKg: lastKgMap,
      recent,
      totalSessions: total[0]?.n ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Erro ao carregar dados' }, { status: 500 });
  }
}
