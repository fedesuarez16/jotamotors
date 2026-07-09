"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Turno, TurnoEstado } from "@/lib/types";
import { setTurnoEstadoAction, setTurnoNotaAction } from "./actions";

const ESTADO_LABELS: Record<TurnoEstado, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

const ESTADO_COLORS: Record<TurnoEstado, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

function EstadoSelect({ id, estado }: { id: string; estado: TurnoEstado }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <select
      defaultValue={estado}
      disabled={isPending}
      className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 disabled:opacity-50"
      onChange={(e) => {
        startTransition(async () => {
          await setTurnoEstadoAction(id, e.target.value);
          router.refresh();
        });
      }}
    >
      {(Object.keys(ESTADO_LABELS) as TurnoEstado[]).map((e) => (
        <option key={e} value={e}>
          {ESTADO_LABELS[e]}
        </option>
      ))}
    </select>
  );
}

function NotaInput({ id, nota }: { id: string; nota: string | null }) {
  const [isPending, startTransition] = useTransition();
  return (
    <input
      type="text"
      defaultValue={nota ?? ""}
      placeholder="—"
      disabled={isPending}
      className="w-full min-w-[120px] rounded border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-700 placeholder-zinc-300 focus:border-zinc-400 focus:outline-none disabled:opacity-50"
      onBlur={(e) => {
        const value = e.target.value.trim();
        if (value === (nota ?? "")) return;
        startTransition(async () => {
          await setTurnoNotaAction(id, value);
        });
      }}
    />
  );
}

export function TurnosTable({ turnos }: { turnos: Turno[] }) {
  if (turnos.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">
          No hay turnos registrados todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 bg-white text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {[
              "Nombre / Teléfono",
              "Día",
              "Hora",
              "Servicio",
              "Estado",
              "Notas",
              "Recibido",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {turnos.map((turno) => (
            <tr key={turno.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3">
                <span className="block text-sm font-medium text-zinc-800">
                  {turno.leads?.name ?? (
                    <span className="font-mono text-xs text-zinc-500">
                      {turno.phone}
                    </span>
                  )}
                </span>
                {turno.leads?.name && (
                  <span className="font-mono text-xs text-zinc-400">
                    {turno.phone}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-700">{turno.dia_raw}</td>
              <td className="px-4 py-3 text-zinc-700">{turno.hora_raw}</td>
              <td className="px-4 py-3 text-zinc-500">
                {turno.servicio ?? (
                  <span className="text-zinc-300">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[turno.estado as TurnoEstado]}`}
                  >
                    {ESTADO_LABELS[turno.estado as TurnoEstado]}
                  </span>
                  <EstadoSelect
                    id={turno.id}
                    estado={turno.estado as TurnoEstado}
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <NotaInput id={turno.id} nota={turno.notas_operador} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
                {new Date(turno.created_at).toLocaleString("es-CL", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
