"use client";

import { useTransition } from "react";
import type { EnvioProgramado } from "@/lib/types";
import { cancelarEnvioProgramadoAction } from "@/app/actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CancelarButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("¿Cancelar este envío programado?")) return;
        startTransition(async () => {
          const result = await cancelarEnvioProgramadoAction(id);
          if (!result.ok) window.alert(`Error: ${result.error}`);
        });
      }}
      className="rounded px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isPending ? "…" : "Cancelar"}
    </button>
  );
}

export function EnviosProgramadosTable({ rows }: { rows: EnvioProgramado[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">
        Envíos programados
      </h2>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No hay envíos programados pendientes.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Podés programar uno desde la tabla de leads eligiendo fecha y hora
            en el envío masivo.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <Th>Se envía el</Th>
                <Th>Template</Th>
                <Th className="text-right">Contactos</Th>
                <Th>Estado</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/50">
                  <Td className="text-sm text-zinc-600">
                    {formatDate(row.scheduled_at)}
                  </Td>
                  <Td>
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800">
                      {row.template_name}
                    </code>
                  </Td>
                  <Td className="text-right tabular-nums">
                    {row.lead_ids.length}
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.status === "pendiente"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </Td>
                  <Td>
                    {row.status === "pendiente" ? (
                      <CancelarButton id={row.id} />
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 ${className}`}
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
    <td className={`whitespace-nowrap px-4 py-3 ${className}`}>{children}</td>
  );
}
