-- Cotizaciones generadas desde el CRM (PDF + envío por mail). Montos en CLP. `total` = neto (sin IVA); IVA 19% opcional (con_iva), se calcula en la app.
-- Correr en el SQL editor de Supabase (después de clientes.sql).

create table if not exists public.cotizaciones (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  cliente_id uuid references public.clientes(id) on delete set null,
  cliente_nombre text not null,
  cliente_email text not null,
  cliente_telefono text,
  vehiculo text,
  patente text,
  items jsonb not null,
  total bigint not null,
  validez_dias int not null default 15,
  observaciones text,
  estado text not null default 'borrador'
    check (estado in ('borrador', 'enviada', 'error')),
  enviada_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists cotizaciones_created_at_idx on public.cotizaciones (created_at desc);

alter table public.cotizaciones enable row level security;

-- IVA opcional por cotización (2026-11-12). Las existentes quedan sin IVA.
alter table public.cotizaciones add column if not exists con_iva boolean not null default false;

notify pgrst, 'reload schema';
