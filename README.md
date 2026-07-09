# Jotamotors CRM

CRM mínimo para visualizar los leads que entran por WhatsApp (vía el workflow de n8n + YCloud) y se persisten en Supabase.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- Supabase JS client (server-side, service_role)

## Funcionalidad actual

- Tabla con todos los leads ordenados por último contacto
- Filtros: todos / Meta Ads / orgánico
- Stats: totales por origen
- Badges para `source` y `status`
- Estado vacío + manejo de error si falta config

## Pasos para correrlo (lo que tenés que hacer vos)

### 1. Instalar dependencias

```bash
cd crm
npm install
```

### 2. Configurar variables de entorno

Crear el archivo `crm/.env.local` con este contenido:

```bash
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

Dónde obtenerlas:
- En Supabase → tu proyecto → **Project Settings** → **API**
- `SUPABASE_URL` = "Project URL"
- `SUPABASE_SERVICE_ROLE_KEY` = "Project API keys" → **service_role** (la `secret`, no la `anon`)

> Importante: la `service_role` key bypassea RLS. Solo se usa server-side, NUNCA llega al browser. No la commitees ni la pongas en una variable `NEXT_PUBLIC_*`.

### 3. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

### 4. (Opcional) Build de producción

```bash
npm run build
npm run start
```

## Estructura

```
crm/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout raíz con Tailwind
│   │   ├── page.tsx         # Página única: tabla + filtros + stats
│   │   └── globals.css      # Tailwind v4 import + theme tokens
│   ├── components/
│   │   ├── Badge.tsx        # SourceBadge / StatusBadge
│   │   ├── Filters.tsx      # Tabs de filtro por origen (URL-based)
│   │   └── LeadsTable.tsx   # Tabla principal
│   └── lib/
│       ├── supabase.ts      # Cliente server-only con service_role
│       └── types.ts         # Lead, LeadSource, LeadStatus
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## Limitaciones intencionales (por ser MVP)

- **Sin autenticación**: cualquiera con la URL puede ver los leads. Antes de exponerlo a internet hay que agregar Supabase Auth, NextAuth o similar.
- **Sin paginación**: limitado a los 200 leads más recientes. Si superan ese número, agregar paginación.
- **Solo lectura**: no se puede cambiar `status` ni eliminar leads desde la UI todavía.
- **Sin vista de mensajes**: la tabla `messages` con el historial existe en Supabase pero el CRM aún no la muestra.
- **Sin gráficos / analytics**: solo conteos básicos.

## Próximos pasos sugeridos

1. Página `/leads/[id]` con detalle del lead + historial de mensajes
2. Acción para cambiar `status` (server action)
3. Auth (Supabase Auth con magic link es lo más rápido)
4. Real-time updates (Supabase realtime sub a la tabla `leads`)
5. Paginación / búsqueda por teléfono
