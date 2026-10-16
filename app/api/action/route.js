import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '../../../lib/db';

export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const id = (v) => typeof v === 'string' && /^[a-z0-9_-]{1,40}$/i.test(v);
const num = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

export async function POST(req) {
  try {
    const b = await req.json();
    const date = b?.date;
    if (!date || !DATE_RE.test(date)) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
    }
    await ensureSchema();
    const s = sql();

    switch (b.type) {
      case 'set': {
        const setNo = num(b.setNo, 1, 20);
        if (!id(b.exerciseId) || setNo === null) break;
        if (b.done) {
          const kg = b.kg === null || b.kg === '' || b.kg === undefined ? null : num(b.kg, 0, 1000);
          await s`insert into set_logs (date, exercise_id, set_no, kg)
                  values (${date}::date, ${b.exerciseId}, ${setNo}, ${kg})
                  on conflict (date, exercise_id, set_no) do update set kg = excluded.kg`;
        } else {
          await s`delete from set_logs where date = ${date}::date and exercise_id = ${b.exerciseId} and set_no = ${setNo}`;
        }
        break;
      }
      case 'kg': {
        const kg = num(b.kg, 0, 1000);
        if (!id(b.exerciseId) || kg === null) break;
        await s`update set_logs set kg = ${kg} where date = ${date}::date and exercise_id = ${b.exerciseId}`;
        break;
      }
      case 'meal': {
        if (!id(b.mealId)) break;
        if (b.done) {
          await s`insert into meal_checks (date, meal_id) values (${date}::date, ${b.mealId}) on conflict do nothing`;
        } else {
          await s`delete from meal_checks where date = ${date}::date and meal_id = ${b.mealId}`;
        }
        break;
      }
      case 'water': {
        const ml = num(b.ml, 0, 10000);
        if (ml === null) break;
        await s`insert into water_logs (date, ml) values (${date}::date, ${ml})
                on conflict (date) do update set ml = excluded.ml`;
        break;
      }
      case 'cardio': {
        const minutes = num(b.minutes, 1, 300);
        const kind = typeof b.kind === 'string' ? b.kind.slice(0, 30) : 'Cardio';
        if (minutes === null) break;
        await s`insert into cardio_logs (date, kind, minutes) values (${date}::date, ${kind}, ${minutes})`;
        break;
      }
      case 'cardio_delete': {
        const cid = num(b.id, 1, 2147483647);
        if (cid === null) break;
        await s`delete from cardio_logs where id = ${cid}`;
        break;
      }
      case 'finish': {
        if (!id(b.dayKey)) break;
        const dur = b.durationSec == null ? null : num(b.durationSec, 0, 86400);
        await s`insert into sessions (date, day_key, duration_sec) values (${date}::date, ${b.dayKey}, ${dur})
                on conflict (date) do update set day_key = excluded.day_key, duration_sec = excluded.duration_sec, finished_at = now()`;
        break;
      }
      case 'unfinish': {
        await s`delete from sessions where date = ${date}::date`;
        break;
      }
      case 'weight': {
        const kg = num(b.kg, 30, 300);
        if (kg === null) break;
        await s`insert into weight_logs (date, kg) values (${date}::date, ${kg})
                on conflict (date) do update set kg = excluded.kg`;
        break;
      }
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Erro ao salvar' }, { status: 500 });
  }
}
