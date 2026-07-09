export type LeadSource = "meta_ads" | "organic";

export type LeadStatus =
  | "new"
  | "engaged"
  | "qualified"
  | "booked"
  | "closed";

export type ChatState = "inactivo" | "activo" | "cerrado";

export interface Lead {
  id: string;
  phone: string;
  name: string | null;
  source: LeadSource;
  ad_source_id: string | null;
  ad_headline: string | null;
  ad_body: string | null;
  ctwa_clid: string | null;
  first_seen_at: string;
  last_seen_at: string;
  message_count: number;
  status: LeadStatus;
  estado_chat: ChatState;
  seguimiento_enviado_at: string | null;
  seguimiento_cancelado_at: string | null;
}

export type SourceFilter = LeadSource | "all";

export type ChatStateFilter = ChatState | "all";

export type MessageDirection = "inbound" | "outbound";

export interface Message {
  id: string;
  lead_id: string;
  phone: string;
  direction: MessageDirection;
  body: string;
  wamid: string | null;
  created_at: string;
}

export type TurnoEstado = "pendiente" | "confirmado" | "cancelado";

export interface Turno {
  id: string;
  lead_id: string | null;
  phone: string;
  dia_raw: string;
  hora_raw: string;
  fecha_hora: string | null;
  servicio: string | null;
  estado: TurnoEstado;
  notas_operador: string | null;
  created_at: string;
  updated_at: string;
  leads?: { name: string | null } | null;
}

export interface EnvioMasivoFailure {
  phone: string;
  error: string;
}

export interface EnvioMasivoHistorial {
  id: string;
  created_at: string;
  template_name: string;
  total_targets: number;
  sent: number;
  failed: number;
  failures: EnvioMasivoFailure[];
}
