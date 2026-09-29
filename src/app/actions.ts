"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase";
import type { ChatState } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "id requerido" };

  const supabase = getSupabaseServer();

  const { error: msgError } = await supabase
    .from("messages")
    .delete()
    .eq("lead_id", id);
  if (msgError) {
    return { ok: false, error: `messages: ${msgError.message}` };
  }

  const { error: followupError } = await supabase
    .from("lead_followups")
    .delete()
    .eq("lead_id", id);
  if (followupError && !isMissingTable(followupError.message)) {
    return { ok: false, error: `lead_followups: ${followupError.message}` };
  }

  const { error: leadError } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);
  if (leadError) {
    return { ok: false, error: `leads: ${leadError.message}` };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function bulkAddFollowupAction(
  ids: string[]
): Promise<ActionResult> {
  if (ids.length === 0) return { ok: false, error: "Sin selección" };

  const supabase = getSupabaseServer();
  const rows = ids.map((lead_id) => ({ lead_id }));
  const { error } = await supabase
    .from("lead_followups")
    .upsert(rows, { onConflict: "lead_id", ignoreDuplicates: true });

  if (error) {
    return { ok: false, error: `lead_followups: ${error.message}` };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function bulkRemoveFollowupAction(
  ids: string[]
): Promise<ActionResult> {
  if (ids.length === 0) return { ok: false, error: "Sin selección" };

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("lead_followups")
    .delete()
    .in("lead_id", ids);

  if (error) {
    return { ok: false, error: `lead_followups: ${error.message}` };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function bulkDeleteLeadsAction(
  ids: string[]
): Promise<ActionResult> {
  if (ids.length === 0) return { ok: false, error: "Sin selección" };

  const supabase = getSupabaseServer();

  const { error: msgError } = await supabase
    .from("messages")
    .delete()
    .in("lead_id", ids);
  if (msgError) {
    return { ok: false, error: `messages: ${msgError.message}` };
  }

  const { error: followupError } = await supabase
    .from("lead_followups")
    .delete()
    .in("lead_id", ids);
  if (followupError && !isMissingTable(followupError.message)) {
    return { ok: false, error: `lead_followups: ${followupError.message}` };
  }

  const { error: leadError } = await supabase
    .from("leads")
    .delete()
    .in("id", ids);
  if (leadError) {
    return { ok: false, error: `leads: ${leadError.message}` };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function bulkSetChatStateAction(
  ids: string[],
  state: ChatState
): Promise<ActionResult> {
  if (ids.length === 0) return { ok: false, error: "Sin selección" };
  if (state !== "activo" && state !== "inactivo" && state !== "cerrado") {
    return { ok: false, error: "estado inválido" };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("leads")
    .update({ estado_chat: state })
    .in("id", ids);

  if (error) {
    return { ok: false, error: `leads: ${error.message}` };
  }

  revalidatePath("/");
  return { ok: true };
}

export type BulkSendResult =
  | {
      ok: true;
      sent: number;
      failed: number;
      failures: { phone: string; error: string }[];
    }
  | { ok: false; error: string };

export type WhatsAppTemplate = {
  name: string;
  language: string;
  bodyText: string;
};

export type ListTemplatesResult =
  | { ok: true; templates: WhatsAppTemplate[] }
  | { ok: false; error: string };

type YCloudTemplateComponent = {
  type: string;
  format?: string;
  text?: string;
  example?: { header_url?: string[] };
};

type YCloudTemplate = {
  name: string;
  language: string;
  status: string;
  components?: YCloudTemplateComponent[];
};

async function fetchYCloudTemplates(apiKey: string): Promise<YCloudTemplate[]> {
  const res = await fetch(
    "https://api.ycloud.com/v2/whatsapp/templates?limit=100",
    { headers: { "X-API-Key": apiKey }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`YCloud templates: HTTP ${res.status}`);
  const data = (await res.json()) as { items?: YCloudTemplate[] };
  return data.items ?? [];
}

type TemplateComponent = {
  type: "header";
  parameters: Record<string, unknown>[];
};

// Un header IMAGE/VIDEO/DOCUMENT exige mandar el media en CADA envío: la
// imagen que se subió al crear la plantilla es solo el ejemplo para la
// aprobación de Meta, no viaja sola. Sin esto YCloud acepta el request con
// HTTP 200 y Meta lo rechaza después con 132012 ("Format mismatch, expected
// IMAGE, received UNKNOWN"), así que el mensaje se cobra y nunca llega.
function buildTemplateComponents(
  tpl: YCloudTemplate
): TemplateComponent[] | undefined {
  const header = tpl.components?.find((c) => c.type === "HEADER");
  if (!header?.format || header.format === "TEXT") return undefined;

  const link = header.example?.header_url?.[0];
  if (!link) return undefined;

  const kind = header.format.toLowerCase();
  return [{ type: "header", parameters: [{ type: kind, [kind]: { link } }] }];
}

export async function listApprovedTemplatesAction(): Promise<ListTemplatesResult> {
  const apiKey = process.env.YCLOUD_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "YCLOUD_API_KEY debe estar configurado en .env.local",
    };
  }

  let items: YCloudTemplate[];
  try {
    items = await fetchYCloudTemplates(apiKey);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "YCloud templates falló",
    };
  }

  const templates = items
    .filter((t) => t.status === "APPROVED")
    .map((t) => ({
      name: t.name,
      language: t.language,
      bodyText: t.components?.find((c) => c.type === "BODY")?.text ?? "",
    }));

  return { ok: true, templates };
}

export type EnvioScheduleResult =
  | { ok: true; sendHour: number }
  | { ok: false; error: string };

export async function getEnvioScheduleAction(): Promise<EnvioScheduleResult> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("envio_masivo_config")
    .select("send_hour")
    .eq("id", 1)
    .single();

  if (error) return { ok: false, error: `config: ${error.message}` };
  return { ok: true, sendHour: data.send_hour as number };
}

export async function setEnvioScheduleAction(
  hour: number
): Promise<ActionResult> {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { ok: false, error: "hora inválida (0-23)" };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("envio_masivo_config")
    .update({ send_hour: hour, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return { ok: false, error: `config: ${error.message}` };

  revalidatePath("/envios");
  return { ok: true };
}

export async function bulkSendTemplateAction(
  ids: string[],
  template: { name: string; language: string }
): Promise<BulkSendResult> {
  if (ids.length === 0) return { ok: false, error: "Sin selección" };
  if (!template?.name || !template?.language) {
    return { ok: false, error: "Plantilla no seleccionada" };
  }

  const apiKey = process.env.YCLOUD_API_KEY;
  const fromPhone = process.env.YCLOUD_PHONE_NUMBER;

  if (!apiKey || !fromPhone) {
    return {
      ok: false,
      error:
        "YCLOUD_API_KEY y YCLOUD_PHONE_NUMBER deben estar configurados en .env.local",
    };
  }

  // Resolvemos la definición en YCloud (no confiamos en lo que mandó el
  // cliente) para saber si la plantilla lleva header multimedia.
  let definition: YCloudTemplate | undefined;
  try {
    const items = await fetchYCloudTemplates(apiKey);
    definition = items.find(
      (t) => t.name === template.name && t.language === template.language
    );
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "YCloud templates falló",
    };
  }

  if (!definition) {
    return {
      ok: false,
      error: `La plantilla ${template.name} (${template.language}) no existe en YCloud`,
    };
  }

  const components = buildTemplateComponents(definition);
  const header = definition.components?.find((c) => c.type === "HEADER");

  // Cortamos acá en vez de quemar plata: sin el media, Meta rechaza los N
  // mensajes uno por uno y YCloud igual los cobra.
  if (header?.format && header.format !== "TEXT" && !components) {
    return {
      ok: false,
      error: `La plantilla ${template.name} tiene un header ${header.format} pero YCloud no expone la URL de ejemplo; no se puede enviar sin el archivo.`,
    };
  }

  const supabase = getSupabaseServer();
  const { data: leads, error: fetchError } = await supabase
    .from("leads")
    .select("id, phone")
    .in("id", ids);

  if (fetchError) return { ok: false, error: `leads: ${fetchError.message}` };
  if (!leads || leads.length === 0)
    return { ok: false, error: "No se encontraron leads" };

  const results = await Promise.allSettled(
    leads.map(async (lead) => {
      const phone = lead.phone.startsWith("+")
        ? lead.phone
        : `+${lead.phone}`;

      const res = await fetch("https://api.ycloud.com/v2/whatsapp/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          from: fromPhone,
          to: phone,
          type: "template",
          template: {
            name: template.name,
            language: { code: template.language },
            ...(components ? { components } : {}),
          },
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
          error?: { message?: string };
        };
        throw new Error(
          body.error?.message ?? body.message ?? `HTTP ${res.status}`
        );
      }

      return lead.phone as string;
    })
  );

  const failures: { phone: string; error: string }[] = [];
  let sent = 0;

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      sent++;
    } else {
      failures.push({
        phone: leads[i].phone as string,
        error: (result.reason as Error)?.message ?? "Error desconocido",
      });
    }
  });

  try {
    const { error: histError } = await supabase
      .from("envio_masivo_historial")
      .insert({
        template_name: template.name,
        total_targets: leads.length,
        sent,
        failed: failures.length,
        failures,
      });
    if (histError) {
      console.error(
        "[bulkSendTemplateAction] insert envio_masivo_historial falló:",
        histError.message
      );
    }
  } catch (err) {
    console.error(
      "[bulkSendTemplateAction] insert envio_masivo_historial lanzó excepción:",
      err
    );
  }

  return { ok: true, sent, failed: failures.length, failures };
}

export async function scheduleBulkSendAction(
  ids: string[],
  template: { name: string; language: string },
  scheduledAtIso: string
): Promise<ActionResult> {
  if (ids.length === 0) return { ok: false, error: "Sin selección" };
  if (!template?.name || !template?.language) {
    return { ok: false, error: "Plantilla no seleccionada" };
  }

  const scheduledAt = new Date(scheduledAtIso);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, error: "Fecha inválida" };
  }
  if (scheduledAt.getTime() <= Date.now()) {
    return { ok: false, error: "La fecha debe ser futura" };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("envios_programados").insert({
    lead_ids: ids,
    template_name: template.name,
    template_lang: template.language,
    scheduled_at: scheduledAt.toISOString(),
  });

  if (error) {
    return { ok: false, error: `envios_programados: ${error.message}` };
  }

  revalidatePath("/envios");
  return { ok: true };
}

export async function cancelarEnvioProgramadoAction(
  id: string
): Promise<ActionResult> {
  if (!id) return { ok: false, error: "id requerido" };

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("envios_programados")
    .update({ status: "cancelado" })
    .eq("id", id)
    .eq("status", "pendiente")
    .select("id");

  if (error) {
    return { ok: false, error: `envios_programados: ${error.message}` };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "El envío ya fue procesado o cancelado" };
  }

  revalidatePath("/envios");
  return { ok: true };
}

export async function updateLeadFieldAction(
  id: string,
  field: "source" | "status" | "ad_source_id",
  value: string | null
): Promise<ActionResult> {
  if (!id) return { ok: false, error: "id requerido" };

  if (field === "source") {
    if (value !== "meta_ads" && value !== "organic") {
      return { ok: false, error: "source inválido" };
    }
  }

  if (field === "status") {
    const validStatuses = ["new", "engaged", "qualified", "booked", "closed"];
    if (!value || !validStatuses.includes(value)) {
      return { ok: false, error: "status inválido" };
    }
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("leads")
    .update({ [field]: value })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}

function isMissingTable(message: string): boolean {
  return (
    message.includes('relation "lead_followups" does not exist') ||
    message.includes("Could not find the table")
  );
}
