import { getSupabaseServer } from "@/lib/supabase";
import type { EnvioMasivoHistorial, EnvioProgramado } from "@/lib/types";
import { EnviosTable } from "@/components/EnviosTable";
import { EnviosProgramadosTable } from "@/components/EnviosProgramadosTable";
import { EnvioScheduleCard } from "@/components/EnvioScheduleCard";
import { getEnvioScheduleAction } from "@/app/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchHistorial(): Promise<EnvioMasivoHistorial[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("envio_masivo_historial")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Supabase historial: ${error.message}`);
  return (data ?? []) as EnvioMasivoHistorial[];
}

async function fetchProgramados(): Promise<EnvioProgramado[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("envios_programados")
    .select("*")
    .in("status", ["pendiente", "procesando"])
    .order("scheduled_at", { ascending: true })
    .limit(100);
  if (error) throw new Error(`Supabase programados: ${error.message}`);
  return (data ?? []) as EnvioProgramado[];
}

export default async function EnviosPage() {
  let rows: EnvioMasivoHistorial[] = [];
  let programados: EnvioProgramado[] = [];
  let errorMessage: string | null = null;
  let programadosError: string | null = null;

  try {
    rows = await fetchHistorial();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  try {
    programados = await fetchProgramados();
  } catch (err) {
    programadosError = err instanceof Error ? err.message : "Unknown error";
  }

  const schedule = await getEnvioScheduleAction();

  return (
    <div className="page">
      {schedule.ok && <EnvioScheduleCard sendHour={schedule.sendHour} />}
      {programadosError ? (
        <div className="mb-8 alert-error">
          <p className="text-sm font-medium text-red-800">
            No se pudieron cargar los envíos programados
          </p>
          <p className="mt-1 font-mono text-xs text-red-600">
            {programadosError}
          </p>
        </div>
      ) : (
        <EnviosProgramadosTable rows={programados} />
      )}
      {errorMessage ? (
        <div className="alert-error">
          <p className="text-sm font-medium text-red-800">
            No se pudo cargar el historial
          </p>
          <p className="mt-1 font-mono text-xs text-red-600">{errorMessage}</p>
          <p className="mt-3 text-xs text-red-700">
            Verificá que la tabla{" "}
            <code className="font-mono">envio_masivo_historial</code> exista en
            Supabase.
          </p>
        </div>
      ) : (
        <section>
          <h2 className="section-title mb-3">Historial de envíos</h2>
          <EnviosTable rows={rows} />
        </section>
      )}
    </div>
  );
}
