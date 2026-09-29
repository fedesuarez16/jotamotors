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
  plantilla1_enviado_at: string | null;
  seguimiento_override_texto: string | null;
  seguimiento_override_template: string | null;
  seguimiento_override_template_lang: string | null;
}

export type SeguimientoTipo = "seguimiento_24h" | "plantilla";

export interface EnviadoRow {
  lead: Lead;
  tipo: SeguimientoTipo;
  sentAt: string;
}

export interface ProgramadoRow {
  lead: Lead;
  tipo: SeguimientoTipo;
  estimatedSendLabel: string;
  estimatedSendAt: string;
}

// Seguimiento que debía haber salido y no tiene marca de envío: el cron no lo
// tomó o YCloud rechazó el request. Sin la sección que las muestra, estas
// filas desaparecían de la pantalla sin dejar rastro.
export interface NoEnviadoRow {
  lead: Lead;
  tipo: SeguimientoTipo;
  expectedAt: string;
  expectedLabel: string;
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

export type EnvioProgramadoStatus =
  | "pendiente"
  | "procesando"
  | "enviado"
  | "cancelado"
  | "error";

export interface EnvioProgramado {
  id: string;
  created_at: string;
  scheduled_at: string;
  template_name: string;
  template_lang: string;
  lead_ids: string[];
  status: EnvioProgramadoStatus;
  sent: number | null;
  failed: number | null;
  failures: EnvioMasivoFailure[] | null;
  processed_at: string | null;
}

export interface ClienteInput {
  nombre?: string | null;
  apellido?: string | null;
  apellido_materno?: string | null;
  email?: string | null;
  email_2?: string | null;
  telefono?: string | null;
  etiquetas?: string | null;
  estado_email?: string | null;
  estado_sms?: string | null;
  ultima_actividad?: string | null;
  ultima_actividad_at?: string | null;
  fuente?: string | null;
  idioma?: string | null;
  creado_en_origen?: string | null;
  extra: Record<string, string>;
}

export interface Cliente extends ClienteInput {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CotizacionItem {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CotizacionInput {
  cliente_id?: string | null;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono?: string | null;
  vehiculo?: string | null;
  patente?: string | null;
  items: CotizacionItem[];
  validez_dias?: number;
  observaciones?: string | null;
}

export type CotizacionEstado = "borrador" | "enviada" | "error";

export interface Cotizacion extends CotizacionInput {
  id: string;
  numero: number;
  total: number;
  validez_dias: number;
  estado: CotizacionEstado;
  enviada_at: string | null;
  error: string | null;
  created_at: string;
}
