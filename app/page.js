'use client';

import { useCallback, useEffect, useState } from 'react';
import Training from '../components/Training';
import Food from '../components/Food';
import Progress from '../components/Progress';
import { localDate, todayKey } from '../lib/plan';

const TABS = [
  {
    id: 'treino',
    label: 'Treino',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
      </svg>
    ),
  },
  {
    id: 'alimentacao',
    label: 'Alimentação',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M9 3v6M17 21V3c-2 1-4 4-4 8 0 2 1 3 4 3" />
      </svg>
    ),
  },
  {
    id: 'progresso',
    label: 'Progresso',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
      </svg>
    ),
  },
];

export default function Page() {
  const [tab, setTab] = useState('treino');
  const [date, setDate] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDate(localDate());
    const onVis = () => {
      if (document.visibilityState === 'visible') setDate(localDate());
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const load = useCallback(async () => {
    if (!date) return;
    try {
      const r = await fetch(`/api/state?date=${date}`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro ao carregar');
      setData(j);
      setError(null);
    } catch (e) {
      setError(e.message || 'Sem conexão');
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = useCallback((fn) => setData((d) => (d ? fn(d) : d)), []);

  const act = useCallback(
    async (body) => {
      try {
        const r = await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, date }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || 'Erro ao salvar');
        }
        setError(null);
      } catch (e) {
        setError(e.message || 'Não foi possível salvar. Verifique a conexão.');
      }
    },
    [date]
  );

  const rawLabel = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '')
    : '';
  const dateLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  return (
    <>
      <main className="app">
        <header className="head">
          <div className="brand">
            <div className="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
              </svg>
            </div>
            <div>
              <h1>
                Victor <span>Training</span>
              </h1>
              <small>Menos gordura, mais músculo</small>
            </div>
          </div>
          <div className="date-pill">{dateLabel}</div>
        </header>

        {error && (
          <div className="banner">
            ⚠️ {error}{' '}
            <button style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }} onClick={load}>
              Tentar de novo
            </button>
          </div>
        )}

        {!data ? (
          <>
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        ) : (
          <>
            {tab === 'treino' && (
              <Training data={data} date={date} todayKey={todayKey()} act={act} mutate={mutate} reload={load} />
            )}
            {tab === 'alimentacao' && <Food data={data} act={act} mutate={mutate} />}
            {tab === 'progresso' && <Progress data={data} act={act} reload={load} />}
          </>
        )}
      </main>

      <nav className="tabbar">
        <div className="tabbar-in">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
