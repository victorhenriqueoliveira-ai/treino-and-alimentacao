'use client';

import { useState } from 'react';
import { MEALS, TARGETS, HUNGER_FREE, SWAPS } from '../lib/plan';

export default function Food({ data, act, mutate }) {
  const [showSwaps, setShowSwaps] = useState(false);
  const eaten = MEALS.filter((m) => data.meals.includes(m.id));
  const kcal = eaten.reduce((n, m) => n + m.kcal, 0);
  const protein = eaten.reduce((n, m) => n + m.protein, 0);

  const toggle = (m) => {
    const on = data.meals.includes(m.id);
    mutate((d) => ({ ...d, meals: on ? d.meals.filter((x) => x !== m.id) : [...d.meals, m.id] }));
    act({ type: 'meal', mealId: m.id, done: !on });
  };

  const setWater = (ml) => {
    const v = Math.max(0, Math.min(10000, ml));
    mutate((d) => ({ ...d, waterMl: v }));
    act({ type: 'water', ml: v });
  };

  const R = 56;
  const C = 2 * Math.PI * R;
  const pct = Math.min(1, kcal / TARGETS.kcal);
  const waterPct = Math.min(100, (data.waterMl / TARGETS.water) * 100);

  return (
    <>
      <div className="card glow">
        <div className="row" style={{ gap: 18 }}>
          <div className="big-ring">
            <svg width="132" height="132" viewBox="0 0 132 132">
              <circle cx="66" cy="66" r={R} fill="none" stroke="#12214a" strokeWidth="12" />
              <circle
                cx="66"
                cy="66"
                r={R}
                fill="none"
                stroke="url(#g)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <b>{kcal}</b>
              <small>de {TARGETS.kcal} kcal</small>
            </div>
          </div>
          <div className="grow">
            <div className="eyebrow">Meta de hoje</div>
            <div style={{ fontSize: 15, marginTop: 6 }}>
              <b>{protein} g</b> <span className="muted">de {TARGETS.protein} g de proteína</span>
            </div>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (protein / TARGETS.protein) * 100)}%` }} />
            </div>
            <p className="sub" style={{ margin: '10px 0 0', fontSize: 12.5 }}>
              Déficit alto: ~1.800 kcal. Proteína alta protege seu músculo.
            </p>
          </div>
        </div>
      </div>

      {MEALS.map((m) => {
        const on = data.meals.includes(m.id);
        return (
          <button key={m.id} className={`meal ${on ? 'on' : ''}`} onClick={() => toggle(m)}>
            <span className="check">✓</span>
            <div className="grow">
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <b style={{ fontSize: 16 }}>{m.name}</b>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {m.time}
                  </div>
                </div>
                <div className="tag">
                  <b>{m.kcal} kcal</b>
                  {m.protein} g prot.
                </div>
              </div>
              <ul>
                {m.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </button>
        );
      })}

      <div className="card">
        <div className="row between">
          <h2>Água</h2>
          <b style={{ color: 'var(--blue-2)' }}>
            {(data.waterMl / 1000).toFixed(2).replace('.', ',')} / {TARGETS.water / 1000} L
          </b>
        </div>
        <div className="bar" style={{ marginBottom: 14 }}>
          <i style={{ width: `${waterPct}%` }} />
        </div>
        <div className="row">
          <button className="btn ghost small" onClick={() => setWater(data.waterMl - 250)}>
            −250 ml
          </button>
          <button className="btn small grow" onClick={() => setWater(data.waterMl + 250)}>
            + 250 ml
          </button>
          <button className="btn ghost small" onClick={() => setWater(data.waterMl + 500)}>
            + 500
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Bateu fome? 🍽️</h2>
        <p className="sub">Estes itens você pode comer à vontade sem estragar o déficit. Beba 500 ml de água antes de comer.</p>
        <ul className="list">
          {HUNGER_FREE.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="sub" style={{ margin: '12px 0 0', fontSize: 12.5 }}>
          Se a fome ficar insuportável por 3 dias seguidos, suba para 1.900 kcal (mais 1 pão e 1 fruta). Não fique abaixo de 1.600 kcal.
        </p>
      </div>

      <div className="card">
        <button className="row between" style={{ width: '100%' }} onClick={() => setShowSwaps((s) => !s)}>
          <h2 style={{ margin: 0 }}>Trocas baratas</h2>
          <span style={{ color: 'var(--blue-2)', fontSize: 20 }}>{showSwaps ? '−' : '+'}</span>
        </button>
        {showSwaps && (
          <ul className="list" style={{ marginTop: 10 }}>
            {SWAPS.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
