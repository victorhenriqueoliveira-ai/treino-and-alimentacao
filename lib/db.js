import { neon } from '@neondatabase/serverless';

let client;
let ready;

export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL não configurada. Defina a variável de ambiente com a conexão do Neon.');
    client = neon(url);
  }
  return client;
}

// Cria as tabelas na primeira chamada (idempotente).
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const s = sql();
      await s`create table if not exists set_logs (
        date date not null,
        exercise_id text not null,
        set_no int not null,
        kg numeric,
        created_at timestamptz not null default now(),
        primary key (date, exercise_id, set_no)
      )`;
      await s`create table if not exists sessions (
        date date primary key,
        day_key text not null,
        duration_sec int,
        finished_at timestamptz not null default now()
      )`;
      await s`create table if not exists cardio_logs (
        id serial primary key,
        date date not null,
        kind text not null,
        minutes int not null,
        created_at timestamptz not null default now()
      )`;
      await s`create table if not exists meal_checks (
        date date not null,
        meal_id text not null,
        primary key (date, meal_id)
      )`;
      await s`create table if not exists water_logs (
        date date primary key,
        ml int not null default 0
      )`;
      await s`create table if not exists weight_logs (
        date date primary key,
        kg numeric not null
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}
