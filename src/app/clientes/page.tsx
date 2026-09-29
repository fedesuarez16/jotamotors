import { getSupabaseServer } from "@/lib/supabase";
import type { Cliente } from "@/lib/types";
import { ClientesImport } from "./ClientesImport";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function fetchClientes(q: string, page: number) {
  const supabase = getSupabaseServer();
  let query = supabase
    .from("clientes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) {
    // Saco caracteres que rompen la sintaxis del filtro `or` de PostgREST.
    const term = q.replace(/[,()*%]/g, " ").trim();
    if (term) {
      query = query.or(
        ["nombre", "apellido", "apellido_materno", "email", "telefono"]
          .map((c) => `${c}.ilike.%${term}%`)
          .join(",")
      );
    }
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return { clientes: (data ?? []) as Cliente[], count: count ?? 0 };
}

function pageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const s = params.toString();
  return s ? `/clientes?${s}` : "/clientes";
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  let clientes: Cliente[] = [];
  let count = 0;
  let errorMessage: string | null = null;

  try {
    ({ clientes, count } = await fetchClientes(q, page));
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="page">
      <div className="card mb-4 flex flex-wrap items-center justify-between gap-4 p-3">
        <form action="/clientes" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar nombre, email o teléfono…"
            className="input w-72"
          />
          <button
            type="submit"
            className="btn btn-secondary"
          >
            Buscar
          </button>
        </form>
        <ClientesImport />
      </div>

      {errorMessage ? (
        <div className="alert-error">
          <p className="text-sm font-medium text-red-800">
            No se pudo cargar clientes
          </p>
          <p className="mt-1 font-mono text-xs text-red-600">{errorMessage}</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="empty">
          <p className="font-display text-base font-semibold text-ink-900">
            {q ? "Sin resultados" : "Sin clientes"}
          </p>
          <p className="text-sm text-zinc-500">
            {q ? "No hay clientes que coincidan." : "Todavía no hay clientes. Importá un CSV para empezar."}
          </p>
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {["Nombre", "Email", "Teléfono", "Suscripción email", "Última actividad", "Etiquetas", "Fuente"].map((h) => (
                    <th
                      key={h}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {[c.nombre, c.apellido, c.apellido_materno].filter(Boolean).join(" ") || (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{c.email ?? <span className="text-zinc-300">—</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                      {c.telefono ?? <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{c.estado_email ?? <span className="text-zinc-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className="block text-xs text-zinc-600">{c.ultima_actividad ?? "—"}</span>
                      {c.ultima_actividad_at && (
                        <span className="text-xs text-zinc-400">
                          {new Date(c.ultima_actividad_at).toLocaleString("es-CL", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{c.etiquetas ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{c.fuente ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span className="tabular-nums">
              {count} clientes · página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={pageHref(q, page - 1)} className="chip">
                  Anterior
                </a>
              )}
              {page < totalPages && (
                <a href={pageHref(q, page + 1)} className="chip">
                  Siguiente
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
