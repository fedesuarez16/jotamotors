"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase";
import type { ChatState } from "@/lib/types";

const VALID_STATES: ChatState[] = ["inactivo", "activo", "cerrado"];

export type ChatStateResult = { ok: true } | { ok: false; error: string };

export async function setChatStateAction(
  phone: string,
  state: ChatState,
): Promise<ChatStateResult> {
  if (!phone) return { ok: false, error: "phone requerido" };
  if (!VALID_STATES.includes(state)) return { ok: false, error: "estado invalido" };

  const supabase = getSupabaseServer();
  const { error } = await supabase.rpc("set_chat_state", {
    p_phone: phone,
    p_state: state,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}
