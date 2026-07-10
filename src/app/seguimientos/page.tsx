import { getSupabaseServer } from "@/lib/supabase";
import { listApprovedTemplatesAction, type WhatsAppTemplate } from "@/app/actions";
import type { EnviadoRow, Lead, ProgramadoRow } from "@/lib/types";
import { SeguimientosTable } from "@/components/SeguimientosTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LEAD_COLUMNS =
  "id, phone, name, source, ad_source_id, ad_headline, ad_body, ctwa_clid, first_seen_at, last_seen_at, message_count, status, estado_chat, seguimiento_enviado_at, seguimiento_cancelado_at, plantilla1_enviado_at, seguimiento_override_texto, seguimiento_override_template, seguimiento_override_template_lang";

const SANTIAGO_TZ = "America/Santiago";
const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * DAY_MS;
const DEFAULT_SEND_HOUR = 11;

// ─── Date helpers (America/Santiago) ───────────────────────────────────────

function santiagoDateStr(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: SANTIAGO_TZ });
}

function santiagoHour(d: Date): number {
  return Number(
    d.toLocaleString("en-US", {
      timeZone: SANTIAGO_TZ,
      hour: "numeric",
      hourCycle: "h23",
    })
  );
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

// Cron real: meta-followup-daily corre a las 17:00 UTC (13:00 Santiago) y
// selecciona leads cuyo last_seen_at (fecha Santiago) sea "ayer". Los leads
// cuyo día pasó sin envío nunca vuelven a ser elegidos por el cron, así que
// acá los filtramos a "hoy o ayer" para no mostrar zombies.
async function fetchSeguimientoPendientes(): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("source", "meta_ads")
    .in("estado_chat", ["activo", "cerrado"])
    .is("seguimiento_enviado_at", null)
    .is("seguimiento_cancelado_at", null)
    .order("last_seen_at", { ascending: false })
    .limit(500);
  if (error)
    throw new Error(`Supabase seguimiento pendientes: ${error.message}`);
  return (data ?? []) as Lead[];
}

// Cola manual: leads agregados a mano desde /leads (tabla lead_followups),
// sin importar source/estado_chat. El cron meta-followup-daily los toma a
// las 17:00 UTC (13:00 Santiago) igual que a los de seguimiento automático.
async function fetchManualFollowupLeadIds(): Promise<string[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("lead_followups")
    .select("lead_id");
  if (error) return [];
  return (data ?? []).map((r) => r.lead_id as string);
}

async function fetchManualFollowupLeads(ids: string[]): Promise<Lead[]> {
  if (ids.length === 0) return [];
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .in("id", ids)
    .is("seguimiento_enviado_at", null)
    .is("seguimiento_cancelado_at", null)
    .order("last_seen_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Supabase seguimiento manual: ${error.message}`);
  return (data ?? []) as Lead[];
}

async function fetchPlantillaPendientes(): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("source", "meta_ads")
    .in("estado_chat", ["activo", "inactivo"])
    .is("plantilla1_enviado_at", null)
    .is("seguimiento_cancelado_at", null)
    .order("first_seen_at", { ascending: true })
    .limit(500);
  if (error) throw new Error(`Supabase plantilla pendientes: ${error.message}`);
  return (data ?? []) as Lead[];
}

async function fetchSeguimientoEnviados(): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("source", "meta_ads")
    .not("seguimiento_enviado_at", "is", null)
    .order("seguimiento_enviado_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Supabase seguimiento enviados: ${error.message}`);
  return (data ?? []) as Lead[];
}

async function fetchPlantillaEnviados(): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("source", "meta_ads")
    .not("plantilla1_enviado_at", "is", null)
    .order("plantilla1_enviado_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Supabase plantilla enviados: ${error.message}`);
  return (data ?? []) as Lead[];
}

// envio_masivo_config es una tabla de una sola fila (id = 1) que define la
// hora de corrida del cron de plantilla diaria.
async function fetchSendHour(): Promise<number> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("envio_masivo_config")
    .select("send_hour")
    .eq("id", 1)
    .single();
  if (error || !data) return DEFAULT_SEND_HOUR;
  return (data.send_hour as number) ?? DEFAULT_SEND_HOUR;
}

// ─── Row builders ───────────────────────────────────────────────────────────

function buildEnviadosRows(seguimiento: Lead[], plantilla: Lead[]): EnviadoRow[] {
  const rows: EnviadoRow[] = [];
  for (const lead of seguimiento) {
    if (!lead.seguimiento_enviado_at) continue;
    rows.push({
      lead,
      tipo: "seguimiento_24h",
      sentAt: lead.seguimiento_enviado_at,
    });
  }
  for (const lead of plantilla) {
    if (!lead.plantilla1_enviado_at) continue;
    rows.push({ lead, tipo: "plantilla", sentAt: lead.plantilla1_enviado_at });
  }
  rows.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  return rows.slice(0, 200);
}

function buildProgramadosRows(
  seguimiento: Lead[],
  plantilla: Lead[],
  sendHour: number,
  now: Date
): ProgramadoRow[] {
  const todayStr = santiagoDateStr(now);
  const yesterdayStr = santiagoDateStr(new Date(now.getTime() - DAY_MS));
  const rows: ProgramadoRow[] = [];

  for (const lead of seguimiento) {
    const lastSeenDate = new Date(lead.last_seen_at);
    if (isNaN(lastSeenDate.getTime())) continue;
    const lastSeenStr = santiagoDateStr(lastSeenDate);

    let label: string;
    let runDate: Date;
    if (lastSeenStr === yesterdayStr) {
      label = "Hoy a las 13:00";
      runDate = new Date(now);
    } else if (lastSeenStr === todayStr) {
      label = "Mañana a las 13:00";
      runDate = new Date(now.getTime() + DAY_MS);
    } else {
      // Fuera de la ventana hoy/ayer: el cron ya nunca lo va a tomar.
      continue;
    }

    const sendAt = new Date(
      Date.UTC(
        runDate.getUTCFullYear(),
        runDate.getUTCMonth(),
        runDate.getUTCDate(),
        17,
        0,
        0,
        0
      )
    );
    rows.push({
      lead,
      tipo: "seguimiento_24h",
      estimatedSendLabel: label,
      estimatedSendAt: sendAt.toISOString(),
    });
  }

  for (const lead of plantilla) {
    const eligibleAt = new Date(
      new Date(lead.first_seen_at).getTime() + SEVEN_DAYS_MS
    );
    let label: string;
    let sendAt: Date;
    if (eligibleAt.getTime() <= now.getTime()) {
      const runsToday = santiagoHour(now) < sendHour;
      sendAt = runsToday ? new Date(now) : new Date(now.getTime() + DAY_MS);
      label = runsToday
        ? `Hoy a las ${sendHour}:00`
        : `Mañana a las ${sendHour}:00`;
    } else {
      sendAt = eligibleAt;
      const dateLabel = eligibleAt.toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      label = `${dateLabel} ${sendHour}:00`;
    }
    rows.push({
      lead,
      tipo: "plantilla",
      estimatedSendLabel: label,
      estimatedSendAt: sendAt.toISOString(),
    });
  }

  rows.sort(
    (a, b) =>
      new Date(a.estimatedSendAt).getTime() -
      new Date(b.estimatedSendAt).getTime()
  );
  return rows;
}

// Filas de la cola manual: siempre se envían en la próxima corrida del cron
// (13:00 Santiago), sin importar last_seen_at.
function buildManualProgramadosRows(
  leads: Lead[],
  now: Date
): ProgramadoRow[] {
  const runsToday = santiagoHour(now) < 13;
  const label = runsToday ? "Hoy a las 13:00" : "Mañana a las 13:00";
  const runDate = runsToday ? new Date(now) : new Date(now.getTime() + DAY_MS);
  const sendAt = new Date(
    Date.UTC(
      runDate.getUTCFullYear(),
      runDate.getUTCMonth(),
      runDate.getUTCDate(),
      17,
      0,
      0,
      0
    )
  );
  return leads.map((lead) => ({
    lead,
    tipo: "seguimiento_24h" as const,
    estimatedSendLabel: label,
    estimatedSendAt: sendAt.toISOString(),
  }));
}

export default async function SeguimientosPage() {
  let programados: ProgramadoRow[] = [];
  let enviados: EnviadoRow[] = [];
  let programadosError: string | null = null;
  let enviadosError: string | null = null;
  let templates: WhatsAppTemplate[] = [];
  let templatesError: string | null = null;

  const templatesResult = await listApprovedTemplatesAction();
  if (templatesResult.ok) {
    templates = templatesResult.templates;
  } else {
    templatesError = templatesResult.error;
  }

  try {
    const now = new Date();
    const [
      seguimientoPendientes,
      plantillaPendientes,
      sendHour,
      manualFollowupIds,
    ] = await Promise.all([
      fetchSeguimientoPendientes(),
      fetchPlantillaPendientes(),
      fetchSendHour(),
      fetchManualFollowupLeadIds(),
    ]);
    const manualFollowupLeadsRaw = await fetchManualFollowupLeads(
      manualFollowupIds
    );
    // Dedupe: un lead ya listado por la query automática (seguimiento_24h)
    // no debe aparecer dos veces.
    const automaticIds = new Set(seguimientoPendientes.map((l) => l.id));
    const manualFollowupLeads = manualFollowupLeadsRaw.filter(
      (l) => !automaticIds.has(l.id)
    );

    programados = [
      ...buildProgramadosRows(
        seguimientoPendientes,
        plantillaPendientes,
        sendHour,
        now
      ),
      ...buildManualProgramadosRows(manualFollowupLeads, now),
    ].sort(
      (a, b) =>
        new Date(a.estimatedSendAt).getTime() -
        new Date(b.estimatedSendAt).getTime()
    );
  } catch (err) {
    programadosError = err instanceof Error ? err.message : "Unknown error";
  }

  try {
    const [seguimientoEnviados, plantillaEnviados] = await Promise.all([
      fetchSeguimientoEnviados(),
      fetchPlantillaEnviados(),
    ]);
    enviados = buildEnviadosRows(seguimientoEnviados, plantillaEnviados);
  } catch (err) {
    enviadosError = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <SeguimientosTable
        programados={programados}
        enviados={enviados}
        programadosError={programadosError}
        enviadosError={enviadosError}
        templates={templates}
        templatesError={templatesError}
      />
    </div>
  );
}
