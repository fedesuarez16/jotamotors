"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase";
import type { ClienteInput } from "@/lib/types";

export type ImportResult = { ok: true; count: number } | { ok: false; error: string };

const MAX_BATCH = 1000;

/** Upsert de un lote de clientes (dedupe por email). El cliente parte el CSV en lotes. */
export async function importClientesAction(
  clientes: ClienteInput[]
): Promise<ImportResult> {
  if (!Array.isArray(clientes) || clientes.length === 0)
    return { ok: false, error: "lote vacío" };
  if (clientes.length > MAX_BATCH)
    return { ok: false, error: `máximo ${MAX_BATCH} filas por lote` };

  const now = new Date().toISOString();
  const rows = clientes.map((c) => ({ ...c, extra: c.extra ?? {}, updated_at: now }));

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("clientes")
    .upsert(rows, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, count: rows.length };
}

export async function revalidateClientesAction(): Promise<void> {
  revalidatePath("/clientes");
}
