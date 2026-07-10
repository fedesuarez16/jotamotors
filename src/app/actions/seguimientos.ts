"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase";

export async function cancelarSeguimientoAction(
  phone: string
): Promise<{ ok: boolean; error?: string }> {
  if (!phone) return { ok: false, error: "phone requerido" };
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("leads")
    .update({ seguimiento_cancelado_at: new Date().toISOString() })
    .eq("phone", phone);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/seguimientos");
  return { ok: true };
}

const TEXTO_MAX_LEN = 1000;

export interface SeguimientoOverrideInput {
  texto?: string | null;
  template?: string | null;
  templateLang?: string | null;
}

// Solo actualiza las columnas cuyo campo vino definido en el input (undefined
// = no tocar). Esto permite que el modal de "plantilla" ajuste únicamente la
// plantilla sin pisar un override de texto que haya seteado el modal de
// "seguimiento_24h" para el mismo lead, y viceversa.
export async function setSeguimientoOverrideAction(
  id: string,
  input: SeguimientoOverrideInput
): Promise<{ ok: boolean; error?: string }> {
  if (!id) return { ok: false, error: "id requerido" };

  const hasTemplate = input.template !== undefined;
  const hasTemplateLang = input.templateLang !== undefined;
  if (hasTemplate !== hasTemplateLang) {
    return {
      ok: false,
      error: "template y templateLang deben especificarse juntos",
    };
  }
  if (input.template && !input.templateLang) {
    return { ok: false, error: "Falta el idioma de la plantilla" };
  }

  if (
    input.texto !== undefined &&
    input.texto !== null &&
    input.texto.length > TEXTO_MAX_LEN
  ) {
    return {
      ok: false,
      error: `El texto no puede superar ${TEXTO_MAX_LEN} caracteres`,
    };
  }

  const update: Record<string, string | null> = {};
  if (input.texto !== undefined) {
    update.seguimiento_override_texto =
      input.texto === "" ? null : input.texto;
  }
  if (hasTemplate) {
    update.seguimiento_override_template = input.template ?? null;
  }
  if (hasTemplateLang) {
    update.seguimiento_override_template_lang = input.templateLang ?? null;
  }

  if (Object.keys(update).length === 0) return { ok: true };

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/seguimientos");
  return { ok: true };
}
