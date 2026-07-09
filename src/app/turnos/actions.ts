"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function setTurnoEstadoAction(
  id: string,
  estado: string
): Promise<ActionResult> {
  if (!id || !estado) return { ok: false, error: "id y estado requeridos" };
  const supabase = getSupabaseServer();
  const { error } = await supabase.rpc("set_turno_estado", {
    p_id: id,
    p_estado: estado,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/turnos");
  return { ok: true };
}

export async function setTurnoNotaAction(
  id: string,
  nota: string
): Promise<ActionResult> {
  if (!id) return { ok: false, error: "id requerido" };
  const supabase = getSupabaseServer();
  const { error } = await supabase.rpc("set_turno_nota", {
    p_id: id,
    p_nota: nota,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/turnos");
  return { ok: true };
}
