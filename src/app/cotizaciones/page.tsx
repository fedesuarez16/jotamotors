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

async function fetchBorrador(id: string): Promise<Cotizacion | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Cotizacion | null) ?? null;
}

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ borrador?: string }>;
}) {
  const { borrador: borradorId } = await searchParams;
  let cotizaciones: Cotizacion[] = [];
  let errorMessage: string | null = null;

  try {
    cotizaciones = await fetchCotizaciones();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }
  const borrador = borradorId ? await fetchBorrador(borradorId) : null;

  return (
    <div className="page space-y-8 sm:space-y-10">
      <div>
        <h2 className="page-title">
          {borrador
            ? `${borrador.estado === "enviada" ? "Editando" : "Retomando"} ${numeroCotizacion(borrador.numero)}`
            : "Nueva cotización"}
        </h2>
        <p className="page-subtitle">
          {borrador?.estado === "enviada"
            ? "Esta cotización ya se envió. Corregila y reenviala: el cliente recibe el PDF actualizado con el mismo número."
            : borrador
            ? "Seguí completando el borrador. Podés guardarlo de nuevo o enviarlo cuando esté listo."
            : "Completá los datos, revisá el resumen y enviala por mail con el PDF adjunto. Si no terminás, guardala como borrador."}
        </p>
        {borradorId && !borrador && (
          <p className="mt-2 text-sm text-red-600">Esa cotización no existe.</p>
        )}
      </div>

      <CotizacionForm inicial={borrador} />

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
          <>
          {/* Mobile: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {cotizaciones.map((c) => (
              <li key={c.id} className={`card p-4 ${c.id === borrador?.id ? "ring-2 ring-brand-500" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-zinc-500">{numeroCotizacion(c.numero)}</p>
                    <p className="truncate font-medium text-ink-900">
                      {c.cliente_nombre || <span className="text-zinc-400">Sin nombre</span>}
                    </p>
                    {c.cliente_email && <p className="truncate text-xs text-zinc-400">{c.cliente_email}</p>}
                  </div>
                  <span className={`badge shrink-0 ${ESTADO_COLORS[c.estado]}`} title={c.error ?? undefined}>
                    {ESTADO_LABELS[c.estado]}
                  </span>
                </div>
                {(c.vehiculo || c.patente) && (
                  <p className="mt-2 truncate text-sm text-zinc-600">{[c.vehiculo, c.patente].filter(Boolean).join(" · ")}</p>
                )}
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="font-semibold tabular-nums text-ink-900">{formatCLP(c.total)}</span>
                  <span className="text-xs text-zinc-400">
                    {new Date(c.created_at).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
                  <a href={`/cotizaciones?borrador=${c.id}`} className="chip">
                    {c.id === borrador?.id ? "Editando" : c.estado === "enviada" ? "Editar" : "Retomar"}
                  </a>
                  <a href={`/cotizaciones/${c.id}/pdf`} target="_blank" rel="noreferrer" className="chip">
                    PDF
                  </a>
                  <EnviarButton id={c.id} label={c.estado === "enviada" ? "Reenviar" : "Enviar"} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: tabla */}
          <div className="card hidden overflow-x-auto md:block">
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
                      <span className="block font-medium text-ink-900">
                        {c.cliente_nombre || <span className="text-zinc-400">Sin nombre</span>}
                      </span>
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
                          href={`/cotizaciones?borrador=${c.id}`}
                          className={`chip ${c.id === borrador?.id ? "ring-2 ring-brand-500" : ""}`}
                        >
                          {c.id === borrador?.id ? "Editando" : c.estado === "enviada" ? "Editar" : "Retomar"}
                        </a>
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
          </>
        )}
      </section>
    </div>
  );
}
