'use client';

import { useState } from 'react';
import { TARGETS, WEEK } from '../lib/plan';

function fmtDate(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function Chart({ points }) {
  if (points.length < 2) {
    return (
      <p className="sub" style={{ margin: 0 }}>
        Registre seu peso pelo menos 2 vezes para ver o gráfico.
      </p>
    );
  }
  const W = 320;
  const H = 150;
  const pad = 22;
  const kgs = points.map((p) => p.kg);
  const min = Math.min(...kgs, TARGETS.goalKg) - 1;
  const max = Math.max(...kgs) + 1;
  const x = (i) => pad + (i * (W - pad * 2)) / (points.length - 1);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.kg).toFixed(1)}`).join(' ');
  const area = `${path} L${x(points.length - 1)},${H - pad} L${x(0)},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Evolução do peso">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={pad} x2={W - pad} y1={y(TARGETS.goalKg)} y2={y(TARGETS.goalKg)} stroke="#38bdf8" strokeDasharray="4 4" opacity="0.6" />
      <text x={W - pad} y={y(TARGETS.goalKg) - 5} textAnchor="end" fontSize="10" fill="#38bdf8">
        meta {TARGETS.goalKg} kg
      </text>
      <path d={area} fill="url(#area)" />
      <path d={path} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={p.date} cx={x(i)} cy={y(p.kg)} r="3.5" fill="#02040a" stroke="#60a5fa" strokeWidth="2" />
      ))}
      <text x={x(0)} y={H - 4} fontSize="10" fill="#7f8fb8" textAnchor="start">
        {fmtDate(points[0].date)}
      </text>
      <text x={x(points.length - 1)} y={H - 4} fontSize="10" fill="#7f8fb8" textAnchor="end">
        {fmtDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}

export default function Progress({ data, act, reload }) {
  const [kg, setKg] = useState('');
  const last = data.weights.length ? data.weights[data.weights.length - 1].kg : TARGETS.startKg;
  const lost = TARGETS.startKg - last;
  const toGoal = Math.max(0, last - TARGETS.goalKg);
  const pct = Math.max(0, Math.min(100, (lost / (TARGETS.startKg - TARGETS.goalKg)) * 100));

  const save = async () => {
    const v = Number(String(kg).replace(',', '.'));
    if (!v || v < 30 || v > 300) return;
    await act({ type: 'weight', kg: v });
    setKg('');
    reload();
  };

  const name = (key) => WEEK.find((d) => d.key === key)?.title || key;

  return (
    <>
      <div className="card glow">
        <div className="eyebrow">Peso atual</div>
        <div className="row" style={{ alignItems: 'baseline', marginTop: 4 }}>
          <b style={{ fontSize: 44, letterSpacing: '-0.04em' }}>{last.toFixed(1).replace('.', ',')}</b>
          <span className="muted">kg</span>
        </div>
        <p className="sub" style={{ margin: '4px 0 0' }}>
          {lost > 0 ? `−${lost.toFixed(1).replace('.', ',')} kg desde ${TARGETS.startKg} kg` : `Ponto de partida: ${TARGETS.startKg} kg`}
          {' · '}faltam {toGoal.toFixed(1).replace('.', ',')} kg para {TARGETS.goalKg} kg
        </p>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card">
        <h2>Registrar peso</h2>
        <p className="sub">Pese-se 1x por semana, em jejum, no mesmo dia.</p>
        <div className="input-row">
          <label className="kg">
            <input inputMode="decimal" placeholder="Ex.: 92,4" value={kg} onChange={(e) => setKg(e.target.value)} />
            <span>kg</span>
          </label>
          <button className="btn small" style={{ height: 52, borderRadius: 16 }} onClick={save}>
            Salvar
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Evolução</h2>
        <div style={{ marginTop: 10 }}>
          <Chart points={data.weights} />
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <b>{data.totalSessions}</b>
          <span>Treinos concluídos</span>
        </div>
        <div className="stat">
          <b>
            {data.week.sessions.length}
            <small> / {TARGETS.gymDays}</small>
          </b>
          <span>Nesta semana</span>
        </div>
      </div>

      <div className="card">
        <h2>Últimos treinos</h2>
        {data.recent.length === 0 ? (
          <p className="sub" style={{ margin: 0 }}>
            Nenhum treino finalizado ainda. Faça o check-in no fim do treino.
          </p>
        ) : (
          data.recent.map((s) => (
            <div className="hist" key={s.date}>
              <span>
                {fmtDate(s.date)} · {name(s.day_key)}
              </span>
              <b>{s.duration_sec ? `${Math.max(1, Math.round(s.duration_sec / 60))} min` : '✓'}</b>
            </div>
          ))
        )}
      </div>
    </>
  );
}
