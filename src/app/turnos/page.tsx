import { getSupabaseServer } from "@/lib/supabase";
import type { Turno, TurnoEstado } from "@/lib/types";
import { TurnosTable } from "./TurnosTable";
import { StatCard } from "@/components/ui/StatCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ estado?: string }>;
}

function parseEstadoFilter(value: string | undefined): TurnoEstado | null {
  if (value === "pendiente" || value === "confirmado" || value === "cancelado")
    return value;
  return null;
}

async function fetchTurnos(estadoFilter: TurnoEstado | null): Promise<Turno[]> {
  const supabase = getSupabaseServer();
  let query = supabase
    .from("turnos")
    .select("*, leads(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (estadoFilter) {
    query = query.eq("estado", estadoFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return (data ?? []) as Turno[];
}

export default async function TurnosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const estadoFilter = parseEstadoFilter(params.estado);

  let turnos: Turno[] = [];
  let errorMessage: string | null = null;

  try {
    turnos = await fetchTurnos(estadoFilter);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="page">
      {errorMessage ? (
        <div className="alert-error">
          <p className="text-sm font-medium text-red-800">
            No se pudo cargar turnos
          </p>
          <p className="mt-1 font-mono text-xs text-red-600">{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {([null, "pendiente", "confirmado", "cancelado"] as const).map(
              (e) => {
                const active = estadoFilter === e;
                const label =
                  e === null
                    ? "Todos"
                    : e.charAt(0).toUpperCase() + e.slice(1);
                const href = e ? `/turnos?estado=${e}` : "/turnos";
                return (
                  <a
                    key={e ?? "all"}
                    href={href}
                    className={
                      active
                        ? "chip chip-active"
                        : "chip"
                    }
                  >
                    {label}
                  </a>
                );
              }
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total" value={turnos.length} />
            <StatCard
              label="Pendientes"
              value={turnos.filter((t) => t.estado === "pendiente").length}
              accent="brand"
            />
            <StatCard
              label="Confirmados"
              value={turnos.filter((t) => t.estado === "confirmado").length}
              accent="emerald"
            />
          </div>

          <TurnosTable turnos={turnos} />
        </>
      )}
    </div>
  );
}
