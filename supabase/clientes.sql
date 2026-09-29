-- Tabla de clientes (listado importado desde CSV de contactos, ej. export de Wix).
-- Correr en el SQL editor de Supabase.

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  apellido text,
  apellido_materno text,
  email text unique,
  email_2 text,
  telefono text,
  etiquetas text,
  estado_email text,
  estado_sms text,
  ultima_actividad text,
  ultima_actividad_at timestamptz,
  fuente text,
  idioma text,
  creado_en_origen timestamptz,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clientes_telefono_idx on public.clientes (telefono);
create index if not exists clientes_created_at_idx on public.clientes (created_at desc);

alter table public.clientes enable row level security;

notify pgrst, 'reload schema';
