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
      className="btn btn-sm text-zinc-500 hover:bg-red-50 hover:text-red-600"
    >
      {isPending ? "…" : "Cancelar"}
    </button>
  );
}

export function EnviosProgramadosTable({ rows }: { rows: EnvioProgramado[] }) {
  return (
    <section className="mb-8">
      <h2 className="section-title mb-3">
        Envíos programados
      </h2>
      {rows.length === 0 ? (
        <div className="empty">
          <p className="text-sm text-zinc-500">
            No hay envíos programados pendientes.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Podés programar uno desde la tabla de leads eligiendo fecha y hora
            en el envío masivo.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <Th>Se envía el</Th>
                <Th>Template</Th>
                <Th className="text-right">Contactos</Th>
                <Th>Estado</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <Td className="text-sm text-zinc-600">
                    {formatDate(row.scheduled_at)}
                  </Td>
                  <Td>
                    <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-ink-900 ring-1 ring-inset ring-zinc-200">
                      {row.template_name}
                    </code>
                  </Td>
                  <Td className="text-right tabular-nums">
                    {row.lead_ids.length}
                  </Td>
                  <Td>
                    <span
                      className={`badge ${
                        row.status === "pendiente"
                          ? "bg-brand-50 text-brand-700 ring-brand-200"
                          : "bg-sky-50 text-sky-700 ring-sky-200"
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
