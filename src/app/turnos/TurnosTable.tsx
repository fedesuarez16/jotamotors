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
  pendiente: "bg-brand-50 text-brand-700 ring-brand-200",
  confirmado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelado: "bg-red-50 text-red-700 ring-red-200",
};

function EstadoSelect({ id, estado }: { id: string; estado: TurnoEstado }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <select
      defaultValue={estado}
      disabled={isPending}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white py-1 pl-2 pr-7 text-xs font-medium text-zinc-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
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
      className="w-full min-w-[140px] rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-zinc-700 placeholder-zinc-300 transition hover:border-zinc-200 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
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
      <div className="empty">
        <p className="font-display text-base font-semibold text-ink-900">Sin turnos</p>
        <p className="text-sm text-zinc-500">
          No hay turnos registrados todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="table">
        <thead>
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
              <th key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => (
            <tr key={turno.id}>
              <td>
                <span className="block text-sm font-medium text-ink-900">
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
              <td>{turno.dia_raw}</td>
              <td>{turno.hora_raw}</td>
              <td className="text-zinc-500">
                {turno.servicio ?? (
                  <span className="text-zinc-300">—</span>
                )}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${ESTADO_COLORS[turno.estado as TurnoEstado]}`}
                  >
                    {ESTADO_LABELS[turno.estado as TurnoEstado]}
                  </span>
                  <EstadoSelect
                    id={turno.id}
                    estado={turno.estado as TurnoEstado}
                  />
                </div>
              </td>
              <td>
                <NotaInput id={turno.id} nota={turno.notas_operador} />
              </td>
              <td className="whitespace-nowrap text-xs text-zinc-400">
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
