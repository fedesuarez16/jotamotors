"use client";

import { useState, useTransition } from "react";
import type { Lead } from "@/lib/types";
import { ChatStateBadge } from "@/components/Badge";
import { cancelarSeguimientoAction } from "@/app/actions/seguimientos";

// ─── Date formatters ─────────────────────────────────────────────────────────

function formatAbsolute(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "ayer";
  return `hace ${diffDays} días`;
}

// The cron fires at 13:00 UTC (≈ 10:00 America/Santiago).
// Send date = date(last_seen_at) + 1 day at 13:00 UTC.
function computeSendDate(lastSeenAt: string | null): string {
  if (!lastSeenAt) return "—";
  const d = new Date(lastSeenAt);
  if (isNaN(d.getTime())) return "—";
  const send = new Date(d);
  send.setUTCDate(send.getUTCDate() + 1);
  send.setUTCHours(13, 0, 0, 0);
  const diffMs = send.getTime() - Date.now();
  if (diffMs < 0) return "Fuera de ventana";
  const diffH = diffMs / 3_600_000;
  if (diffH < 24) return "Hoy a las 10:00";
  if (diffH < 48) return "Mañana a las 10:00";
  return (
    send.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) + " 10:00"
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
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

function LeadCell({ lead }: { lead: Lead }) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-800">
        {lead.name ?? <span className="text-zinc-400">Sin nombre</span>}
      </p>
      <p className="font-mono text-xs text-zinc-400">{lead.phone}</p>
    </div>
  );
}

// ─── Cancel button ────────────────────────────────────────────────────────────

function CancelButton({ phone }: { phone: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await cancelarSeguimientoAction(phone);
        })
      }
      title="No enviar seguimiento"
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isPending ? (
        "…"
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      )}
      No enviar
    </button>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title,
  count,
  error,
  empty,
  defaultOpen = true,
  children,
}: {
  title: string;
  count: number;
  error: string | null;
  empty: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center gap-2 text-left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-zinc-400 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 tabular-nums">
          {count}
        </span>
      </button>

      {open && (
        <>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                No se pudo cargar esta sección
              </p>
              <p className="mt-1 font-mono text-xs text-red-600">{error}</p>
            </div>
          ) : count === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center">
              <p className="text-sm text-zinc-500">{empty}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              {children}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  programados: Lead[];
  enviados: Lead[];
  programadosError: string | null;
  enviadosError: string | null;
}

export function SeguimientosTable({
  programados,
  enviados,
  programadosError,
  enviadosError,
}: Props) {
  return (
    <div className="space-y-8">
      <Section
        title="Programados"
        count={programados.length}
        error={programadosError}
        empty="No hay seguimientos pendientes."
        defaultOpen
      >
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <Th>Lead</Th>
              <Th>Estado</Th>
              <Th>Último contacto</Th>
              <Th>Cuándo se envía</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {programados.map((lead) => (
              <tr key={lead.id} className="hover:bg-zinc-50/50">
                <Td>
                  <LeadCell lead={lead} />
                </Td>
                <Td>
                  <ChatStateBadge state={lead.estado_chat} />
                </Td>
                <Td className="text-sm text-zinc-500">
                  {formatRelative(lead.last_seen_at)}
                </Td>
                <Td className="text-sm text-zinc-500">
                  {computeSendDate(lead.last_seen_at)}
                </Td>
                <Td>
                  <CancelButton phone={lead.phone} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Enviados"
        count={enviados.length}
        error={enviadosError}
        empty="Todavía no se envió ningún seguimiento."
        defaultOpen
      >
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <Th>Lead</Th>
              <Th>Enviado el</Th>
              <Th>Último contacto</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {enviados.map((lead) => (
              <tr key={lead.id} className="hover:bg-zinc-50/50">
                <Td>
                  <LeadCell lead={lead} />
                </Td>
                <Td className="text-sm text-zinc-600">
                  {formatAbsolute(lead.seguimiento_enviado_at)}
                </Td>
                <Td className="text-sm text-zinc-500">
                  {formatAbsolute(lead.last_seen_at)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
