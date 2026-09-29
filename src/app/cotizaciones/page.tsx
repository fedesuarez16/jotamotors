import { getSupabaseServer } from "@/lib/supabase";
import { formatCLP, numeroCotizacion } from "@/lib/cotizacion";
import type { Cotizacion, CotizacionEstado } from "@/lib/types";
import { CotizacionForm } from "./CotizacionForm";
import { EnviarButton } from "./EnviarButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ESTADO_LABELS: Record<CotizacionEstado, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  error: "Error",
};

const ESTADO_COLORS: Record<CotizacionEstado, string> = {
  borrador: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  enviada: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  error: "bg-red-50 text-red-700 ring-red-200",
};

async function fetchCotizaciones(): Promise<Cotizacion[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return (data ?? []) as Cotizacion[];
}

export default async function CotizacionesPage() {
  let cotizaciones: Cotizacion[] = [];
  let errorMessage: string | null = null;

  try {
    cotizaciones = await fetchCotizaciones();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="page space-y-10">
      <div>
        <h2 className="page-title">Nueva cotización</h2>
        <p className="page-subtitle">Completá los datos, revisá el resumen y enviala por mail con el PDF adjunto.</p>
      </div>

      <CotizacionForm />

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="section-title text-lg">Últimas cotizaciones</h3>
          {cotizaciones.length > 0 && <span className="text-xs text-zinc-400">{cotizaciones.length} más recientes</span>}
        </div>
        {errorMessage ? (
          <div className="alert-error">
            <p className="text-sm font-medium text-red-800">No se pudo cargar cotizaciones</p>
            <p className="mt-1 font-mono text-xs text-red-600">{errorMessage}</p>
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className="empty">
            <p className="text-sm text-zinc-500">Todavía no hay cotizaciones. La primera que guardes aparece acá.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {["Nº", "Cliente", "Vehículo", "Total", "Estado", "Creada", ""].map((h, i) => (
                    <th key={i}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-700">{numeroCotizacion(c.numero)}</td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink-900">{c.cliente_nombre}</span>
                      <span className="text-xs text-zinc-400">{c.cliente_email}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {[c.vehiculo, c.patente].filter(Boolean).join(" · ") || <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-800">{formatCLP(c.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${ESTADO_COLORS[c.estado]}`}
                        title={c.error ?? undefined}
                      >
                        {ESTADO_LABELS[c.estado]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
                      {new Date(c.created_at).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/cotizaciones/${c.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="chip"
                        >
                          PDF
                        </a>
                        <EnviarButton id={c.id} label={c.estado === "enviada" ? "Reenviar" : "Enviar"} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
