import type {
  ChatState,
  LeadSource,
  LeadStatus,
  SeguimientoTipo,
} from "@/lib/types";

const sourceStyles: Record<LeadSource, string> = {
  meta_ads:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  organic:
    "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
};

const sourceLabel: Record<LeadSource, string> = {
  meta_ads: "Meta Ads",
  organic: "Orgánico",
};

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  engaged:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
  qualified:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
  booked:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  closed:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

const statusLabel: Record<LeadStatus, string> = {
  new: "Nuevo",
  engaged: "En conversación",
  qualified: "Calificado",
  booked: "Turno tomado",
  closed: "Cerrado",
};

export function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sourceStyles[source]}`}
    >
      {sourceLabel[source]}
    </span>
  );
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}

const chatStateStyles: Record<ChatState, string> = {
  inactivo:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  activo:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  cerrado:
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
};

const chatStateLabel: Record<ChatState, string> = {
  inactivo: "Inactivo",
  activo: "Activo",
  cerrado: "Cerrado",
};

export function ChatStateBadge({ state }: { state: ChatState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${chatStateStyles[state]}`}
    >
      {chatStateLabel[state]}
    </span>
  );
}

const seguimientoTipoStyles: Record<SeguimientoTipo, string> = {
  seguimiento_24h:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
  plantilla:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
};

const seguimientoTipoLabel: Record<SeguimientoTipo, string> = {
  seguimiento_24h: "Seguimiento 24h",
  plantilla: "Plantilla",
};

export function SeguimientoTipoBadge({ tipo }: { tipo: SeguimientoTipo }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${seguimientoTipoStyles[tipo]}`}
    >
      {seguimientoTipoLabel[tipo]}
    </span>
  );
}

export function PersonalizadoBadge() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
      Personalizado
    </span>
  );
}
