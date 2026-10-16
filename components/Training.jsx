'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { WEEK, TARGETS, CARDIO_KINDS } from '../lib/plan';
import { beep, unlockAudio, vibrate } from '../lib/sound';

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  return new Date(d.getTime() + n * 86400000).toISOString().slice(0, 10);
}

export default function Training({ data, date, todayKey, act, mutate, reload }) {
  const [selected, setSelected] = useState(todayKey);
  const day = WEEK.find((d) => d.key === selected) || WEEK[0];

  // Séries feitas hoje: { exercicio: { nº da série: kg } }
  const doneSets = useMemo(() => {
    const m = {};
    for (const s of data.sets) {
      if (!m[s.exercise_id]) m[s.exercise_id] = {};
      m[s.exercise_id][s.set_no] = s.kg;
    }
    return m;
  }, [data.sets]);

  const [kgs, setKgs] = useState({});
  const getKg = (ex) => {
    if (kgs[ex.id] !== undefined) return kgs[ex.id];
    const logged = doneSets[ex.id] && Object.values(doneSets[ex.id]).find((v) => v !== null);
    if (logged !== undefined && logged !== null) return String(logged);
    if (data.lastKg[ex.id] !== undefined) return String(data.lastKg[ex.id]);
    return '';
  };

  // Cronômetro de descanso
  const [rest, setRest] = useState(null); // { end, total, name }
  const [now, setNow] = useState(Date.now());
  const [ringing, setRinging] = useState(false);
  const firedFor = useRef(null);

  useEffect(() => {
    if (!rest) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [rest]);

  useEffect(() => {
    if (rest && now >= rest.end && firedFor.current !== rest.end) {
      firedFor.current = rest.end;
      setRinging(true);
    }
  }, [now, rest]);

  // Ao tocar o alarme: som + vibração, repetindo até o usuário dispensar
  useEffect(() => {
    if (!ringing) return;
    let n = 0;
    const fire = () => {
      beep(3);
      vibrate([300, 150, 300, 150, 300]);
      n += 1;
      if (n >= 6) clearInterval(id);
    };
    fire();
    const id = setInterval(fire, 4000);
    return () => clearInterval(id);
  }, [ringing]);

  const remaining = rest ? Math.max(0, Math.ceil((rest.end - now) / 1000)) : 0;

  const startRest = (seconds, name) => {
    firedFor.current = null;
    setRinging(false);
    setNow(Date.now());
    setRest({ end: Date.now() + seconds * 1000, total: seconds, name });
  };
  const stopRest = () => {
    setRest(null);
    setRinging(false);
  };
  const adjustRest = (delta) => {
    setRest((r) => {
      if (!r) return r;
      firedFor.current = null;
      setRinging(false);
      return { ...r, end: r.end + delta * 1000, total: Math.max(r.total, r.total + delta) };
    });
  };

  // Mantém a tela acesa durante o treino
  const wake = useRef(null);
  const keepAwake = async () => {
    try {
      if (navigator.wakeLock && !wake.current) {
        wake.current = await navigator.wakeLock.request('screen');
        wake.current.addEventListener('release', () => (wake.current = null));
      }
    } catch {}
  };
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && rest) keepAwake();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [rest]);

  // Horário do primeiro registro do dia (para duração do treino)
  const startKey = `vt-start-${date}`;
  const markStart = () => {
    try {
      if (!localStorage.getItem(startKey)) localStorage.setItem(startKey, String(Date.now()));
    } catch {}
  };

  const toggleSet = (ex, setNo, isLastOfAll) => {
    unlockAudio();
    keepAwake();
    markStart();
    const isDone = doneSets[ex.id] && setNo in doneSets[ex.id];
    const raw = getKg(ex);
    const kg = raw === '' || Number.isNaN(Number(raw)) ? null : Number(raw);
    const nextDone = !isDone;
    mutate((d) => ({
      ...d,
      sets: nextDone
        ? [...d.sets.filter((s) => !(s.exercise_id === ex.id && s.set_no === setNo)), { exercise_id: ex.id, set_no: setNo, kg }]
        : d.sets.filter((s) => !(s.exercise_id === ex.id && s.set_no === setNo)),
    }));
    act({ type: 'set', exerciseId: ex.id, setNo, kg, done: nextDone });
    if (nextDone && !isLastOfAll) startRest(ex.rest, ex.name);
    if (nextDone && isLastOfAll) stopRest();
  };

  const saveKg = (ex) => {
    const v = kgs[ex.id];
    if (v === undefined || v === '' || Number.isNaN(Number(v))) return;
    if (doneSets[ex.id]) {
      mutate((d) => ({ ...d, sets: d.sets.map((s) => (s.exercise_id === ex.id ? { ...s, kg: Number(v) } : s)) }));
      act({ type: 'kg', exerciseId: ex.id, kg: Number(v) });
    }
  };

  const totalSets = day.exercises.reduce((n, e) => n + e.sets, 0);
  const doneCount = day.exercises.reduce((n, e) => n + Object.keys(doneSets[e.id] || {}).length, 0);
  const finished = !!data.session;

  const finish = async () => {
    let durationSec = null;
    try {
      const st = Number(localStorage.getItem(startKey));
      if (st) durationSec = Math.round((Date.now() - st) / 1000);
    } catch {}
    stopRest();
    try {
      wake.current?.release();
    } catch {}
    await act({ type: 'finish', dayKey: day.key, durationSec });
    reload();
  };
  const undoFinish = async () => {
    await act({ type: 'unfinish' });
    reload();
  };

  // Semana
  const weekDone = new Set(data.week.sessions.map((s) => s.day_key));
  const weekDates = WEEK.map((_, i) => addDays(data.weekStart, i));
  const gymCount = new Set(data.week.sessions.map((s) => s.date)).size;
  const cardioCount = data.week.cardio.length;

  // Cardio
  const [kind, setKind] = useState(CARDIO_KINDS[0]);
  const [minutes, setMinutes] = useState(day.cardio?.min || 30);
  useEffect(() => {
    setMinutes(day.cardio?.min || 30);
  }, [day.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const addCardio = async () => {
    await act({ type: 'cardio', kind, minutes });
    reload();
  };
  const delCardio = async (id) => {
    mutate((d) => ({ ...d, week: { ...d.week, cardio: d.week.cardio.filter((c) => c.id !== id) } }));
    await act({ type: 'cardio_delete', id });
  };

  const dayLabel = (iso) => {
    const d = new Date(iso + 'T00:00:00Z');
    return WEEK[(d.getUTCDay() + 6) % 7].short;
  };

  const R = 31;
  const C = 2 * Math.PI * R;

  return (
    <>
      <div className="week">
        {WEEK.map((d, i) => {
          const gymDone = weekDone.has(d.key);
          const cardioDone = data.week.cardio.some((c) => c.date === weekDates[i]);
          const done = d.gym ? gymDone : cardioDone;
          return (
            <button
              key={d.key}
              className={`wd ${selected === d.key ? 'sel' : ''} ${todayKey === d.key ? 'today' : ''}`}
              onClick={() => setSelected(d.key)}
            >
              {d.short}
              <span className={`dot ${done ? 'done' : ''}`}>✓</span>
            </button>
          );
        })}
      </div>

      <div className="stats">
        <div className="stat">
          <b>
            {gymCount}
            <small> / {TARGETS.gymDays}</small>
          </b>
          <span>Treinos na semana</span>
          <div className="bar">
            <i style={{ width: `${Math.min(100, (gymCount / TARGETS.gymDays) * 100)}%` }} />
          </div>
        </div>
        <div className="stat">
          <b>
            {cardioCount}
            <small> / {TARGETS.cardioMin}–{TARGETS.cardioMax}</small>
          </b>
          <span>Cardios na semana</span>
          <div className="bar">
            <i style={{ width: `${Math.min(100, (cardioCount / TARGETS.cardioMin) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="card glow">
        <div className="eyebrow">
          {day.name}
          {selected !== todayKey ? ' · fora do dia' : ' · hoje'}
        </div>
        <h2 style={{ fontSize: 22, marginTop: 4 }}>{day.title}</h2>
        {day.gym ? (
          <>
            <p className="sub" style={{ marginBottom: 10 }}>
              {doneCount} de {totalSets} séries concluídas
            </p>
            <div className="bar" style={{ marginTop: 0 }}>
              <i style={{ width: `${totalSets ? (doneCount / totalSets) * 100 : 0}%` }} />
            </div>
          </>
        ) : (
          <p className="sub" style={{ marginBottom: 0 }}>
            Sem musculação hoje. Faça o cardio abaixo e descanse.
          </p>
        )}
        {day.cardio && day.gym && (
          <p className="sub" style={{ margin: '10px 0 0' }}>🏃 {day.cardio.label}</p>
        )}
      </div>

      {day.exercises.map((ex, exIdx) => {
        const exDone = Object.keys(doneSets[ex.id] || {}).length;
        return (
          <div className="card" key={ex.id}>
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="ex-title">{ex.name}</div>
                <div className="ex-meta">
                  {ex.sets} séries × {ex.reps} · descanso {mmss(ex.rest)}
                </div>
              </div>
              <label className="kg">
                <input
                  inputMode="decimal"
                  placeholder="0"
                  value={getKg(ex)}
                  onChange={(e) => setKgs((k) => ({ ...k, [ex.id]: e.target.value.replace(',', '.') }))}
                  onBlur={() => saveKg(ex)}
                />
                <span>kg</span>
              </label>
            </div>
            <div className="sets">
              {Array.from({ length: ex.sets }, (_, i) => i + 1).map((n) => {
                const on = doneSets[ex.id] && n in doneSets[ex.id];
                const isLastOfAll = exIdx === day.exercises.length - 1 && n === ex.sets;
                return (
                  <button key={n} className={`set ${on ? 'done' : ''}`} onClick={() => toggleSet(ex, n, isLastOfAll)}>
                    {on ? '✓' : n}
                    <small>{ex.reps}</small>
                  </button>
                );
              })}
            </div>
            {exDone === 0 && <div className="ex-tip">💡 {ex.tip}</div>}
          </div>
        );
      })}

      {day.gym &&
        (finished ? (
          <div className="card glow">
            <div className="done-banner">
              <div className="done-badge">✓</div>
              <div className="grow">
                <b>Check-in feito!</b>
                <div className="muted" style={{ fontSize: 13 }}>
                  {data.session.duration_sec ? `Treino de ${Math.max(1, Math.round(data.session.duration_sec / 60))} min` : 'Treino registrado'}
                </div>
              </div>
              <button className="btn ghost small" onClick={undoFinish}>
                Desfazer
              </button>
            </div>
          </div>
        ) : (
          <button className="btn" style={{ marginBottom: 14 }} disabled={doneCount === 0} onClick={finish}>
            Finalizar treino · fazer check-in
          </button>
        ))}

      <div className="card">
        <div className="row between">
          <h2>Cardio</h2>
          <span className="muted" style={{ fontSize: 13 }}>
            {cardioCount} na semana
          </span>
        </div>
        <p className="sub">{day.cardio ? day.cardio.label : 'Meta: 3 a 4 cardios por semana.'}</p>
        <div className="chips" style={{ marginBottom: 14 }}>
          {CARDIO_KINDS.map((k) => (
            <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="stepper">
            <button onClick={() => setMinutes((m) => Math.max(5, m - 5))}>−</button>
            <b>{minutes} min</b>
            <button onClick={() => setMinutes((m) => Math.min(180, m + 5))}>+</button>
          </div>
          <button className="btn small" onClick={addCardio}>
            Registrar
          </button>
        </div>
        {data.week.cardio.length > 0 && (
          <div>
            {data.week.cardio.map((c) => (
              <div className="hist" key={c.id}>
                <span>
                  {dayLabel(c.date)} · {c.kind}
                </span>
                <span className="row">
                  <b>{c.minutes} min</b>
                  <button className="x" onClick={() => delCardio(c.id)} aria-label="Remover">
                    ×
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {rest && (
        <div className={`rest ${ringing ? 'ring' : ''}`}>
          <div className="rest-in">
            <div className="ringsvg">
              <svg width="74" height="74" viewBox="0 0 74 74">
                <circle cx="37" cy="37" r={R} fill="none" stroke={ringing ? 'rgba(255,255,255,.35)' : '#12214a'} strokeWidth="7" />
                <circle
                  cx="37"
                  cy="37"
                  r={R}
                  fill="none"
                  stroke={ringing ? '#fff' : '#38bdf8'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - Math.min(1, remaining / rest.total))}
                  style={{ transition: 'stroke-dashoffset 0.25s linear' }}
                />
              </svg>
              <b>{ringing ? '0:00' : mmss(remaining)}</b>
            </div>
            <div className="rest-txt">
              <strong>{ringing ? 'Hora de voltar! 💪' : 'Descansando'}</strong>
              <small>{ringing ? 'Próxima série' : rest.name}</small>
            </div>
            <div className="rest-btns">
              {ringing ? (
                <button onClick={stopRest}>Bora</button>
              ) : (
                <>
                  <button onClick={() => adjustRest(-15)}>−15</button>
                  <button onClick={() => adjustRest(15)}>+15</button>
                  <button onClick={stopRest}>Pular</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
