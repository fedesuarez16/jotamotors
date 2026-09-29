import type {
  ChatState,
  LeadSource,
  LeadStatus,
  SeguimientoTipo,
} from "@/lib/types";

const tone = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  ink: "bg-ink-900 text-white ring-ink-900",
} as const;

type Tone = keyof typeof tone;

function Badge({
  tone: t,
  dot = false,
  className = "",
  children,
}: {
  tone: Tone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`badge ${tone[t]} ${className}`}>
      {dot && <span className="badge-dot" aria-hidden />}
      {children}
    </span>
  );
}

const sourceTone: Record<LeadSource, Tone> = {
  meta_ads: "brand",
  organic: "neutral",
};

const sourceLabel: Record<LeadSource, string> = {
  meta_ads: "Meta Ads",
  organic: "Orgánico",
};

const statusTone: Record<LeadStatus, Tone> = {
  new: "brand",
  engaged: "sky",
  qualified: "indigo",
  booked: "emerald",
  closed: "neutral",
};

const statusLabel: Record<LeadStatus, string> = {
  new: "Nuevo",
  engaged: "En conversación",
  qualified: "Calificado",
  booked: "Turno tomado",
  closed: "Cerrado",
};

export function SourceBadge({ source }: { source: LeadSource }) {
  return <Badge tone={sourceTone[source]}>{sourceLabel[source]}</Badge>;
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge tone={statusTone[status]} dot>
      {statusLabel[status]}
    </Badge>
  );
}

const chatStateTone: Record<ChatState, Tone> = {
  inactivo: "neutral",
  activo: "emerald",
  cerrado: "red",
};

const chatStateLabel: Record<ChatState, string> = {
  inactivo: "Inactivo",
  activo: "Activo",
  cerrado: "Cerrado",
};

export function ChatStateBadge({ state }: { state: ChatState }) {
  return (
    <Badge tone={chatStateTone[state]} dot>
      {chatStateLabel[state]}
    </Badge>
  );
}

const seguimientoTipoTone: Record<SeguimientoTipo, Tone> = {
  seguimiento_24h: "sky",
  plantilla: "indigo",
};

const seguimientoTipoLabel: Record<SeguimientoTipo, string> = {
  seguimiento_24h: "Seguimiento 24h",
  plantilla: "Plantilla",
};

export function SeguimientoTipoBadge({ tipo }: { tipo: SeguimientoTipo }) {
  return (
    <Badge tone={seguimientoTipoTone[tipo]}>{seguimientoTipoLabel[tipo]}</Badge>
  );
}

export function PersonalizadoBadge() {
  return (
    <Badge tone="ink" className="ml-2 px-2 text-[10px]">
      Personalizado
    </Badge>
  );
}
