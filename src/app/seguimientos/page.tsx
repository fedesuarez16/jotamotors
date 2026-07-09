import { getSupabaseServer } from "@/lib/supabase";
import type { Lead } from "@/lib/types";
import { SeguimientosTable } from "@/components/SeguimientosTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchProgramados(): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, phone, name, source, ad_source_id, ad_headline, ad_body, ctwa_clid, first_seen_at, last_seen_at, message_count, status, estado_chat, seguimiento_enviado_at, seguimiento_cancelado_at"
    )
    .eq("source", "meta_ads")
    .eq("estado_chat", "activo")
    .is("seguimiento_enviado_at", null)
    .is("seguimiento_cancelado_at", null)
    .order("last_seen_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(`Supabase programados: ${error.message}`);
  return (data ?? []) as Lead[];
}

async function fetchEnviados(): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, phone, name, source, ad_source_id, ad_headline, ad_body, ctwa_clid, first_seen_at, last_seen_at, message_count, status, estado_chat, seguimiento_enviado_at, seguimiento_cancelado_at"
    )
    .eq("source", "meta_ads")
    .not("seguimiento_enviado_at", "is", null)
    .order("seguimiento_enviado_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Supabase enviados: ${error.message}`);
  return (data ?? []) as Lead[];
}

export default async function SeguimientosPage() {
  let programados: Lead[] = [];
  let enviados: Lead[] = [];
  let programadosError: string | null = null;
  let enviadosError: string | null = null;

  try {
    programados = await fetchProgramados();
  } catch (err) {
    programadosError = err instanceof Error ? err.message : "Unknown error";
  }

  try {
    enviados = await fetchEnviados();
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
      />
    </div>
  );
}
