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
