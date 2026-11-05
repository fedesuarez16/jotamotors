import type { EnvioMasivoHistorial } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EnviosTable({ rows }: { rows: EnvioMasivoHistorial[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        <p className="text-sm text-zinc-500">No hay envíos registrados todavía.</p>
        <p className="mt-1 text-xs text-zinc-400">
          Cuando realices un envío masivo desde la tabla de leads, aparece acá.
        </p>
      </div>
    );
  }

  return (
    <>
    {/* Mobile: tarjetas */}
    <ul className="space-y-3 md:hidden">
      {rows.map((row) => (
        <li key={row.id} className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <code className="truncate rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-ink-900 ring-1 ring-inset ring-zinc-200">
              {row.template_name}
            </code>
            <span className="shrink-0 text-xs text-zinc-500">{formatDate(row.created_at)}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-zinc-50 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total</p>
              <p className="tabular-nums text-ink-900">{row.total_targets}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Enviados</p>
              <p className="font-medium tabular-nums text-emerald-700">{row.sent}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Fallidos</p>
              <p className={`tabular-nums ${row.failed > 0 ? "font-medium text-red-600" : "text-zinc-400"}`}>{row.failed}</p>
            </div>
          </div>
          {row.failed > 0 && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer select-none text-zinc-500">Ver fallos ({row.failed})</summary>
              <ul className="mt-1.5 space-y-1 pl-2">
                {row.failures.map((f, i) => (
                  <li key={i} className="break-words text-zinc-600">
                    <span className="font-mono">{f.phone}</span> — <span className="text-red-600">{f.error}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </li>
      ))}
    </ul>

    {/* Desktop: tabla */}
    <div className="card hidden overflow-x-auto md:block">
      <table className="table">
        <thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Template</Th>
            <Th className="text-right">Total</Th>
            <Th className="text-right">Enviados</Th>
            <Th className="text-right">Fallidos</Th>
            <Th>Detalle</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td className="text-sm text-zinc-600">{formatDate(row.created_at)}</Td>
              <Td>
                <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-ink-900 ring-1 ring-inset ring-zinc-200">
                  {row.template_name}
                </code>
              </Td>
              <Td className="text-right tabular-nums">{row.total_targets}</Td>
              <Td className="text-right tabular-nums">
                <span className="font-medium text-emerald-700">{row.sent}</span>
              </Td>
              <Td className="text-right tabular-nums">
                {row.failed > 0 ? (
                  <span className="font-medium text-red-600">{row.failed}</span>
                ) : (
                  <span className="text-zinc-400">0</span>
                )}
              </Td>
              <Td>
                {row.failed > 0 ? (
                  <details className="text-xs">
                    <summary className="cursor-pointer select-none text-zinc-500 hover:text-zinc-700">
                      Ver fallos ({row.failed})
                    </summary>
                    <ul className="mt-1.5 space-y-0.5 pl-2">
                      {row.failures.map((f, i) => (
                        <li key={i} className="text-zinc-600">
                          <span className="font-mono">{f.phone}</span>
                          {" — "}
                          <span className="text-red-600">{f.error}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <span className="text-zinc-300">—</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap ${className}`}>{children}</td>
  );
}
