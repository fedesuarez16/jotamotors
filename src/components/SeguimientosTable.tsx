"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { EnviadoRow, Lead, ProgramadoRow } from "@/lib/types";
import type { WhatsAppTemplate } from "@/app/actions";
import {
  ChatStateBadge,
  PersonalizadoBadge,
  SeguimientoTipoBadge,
} from "@/components/Badge";
import { cancelarSeguimientoAction } from "@/app/actions/seguimientos";
import { EditarMensajeButton } from "@/components/EditarMensajeButton";

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

function hasOverride(lead: Lead): boolean {
  return Boolean(
    lead.seguimiento_override_texto || lead.seguimiento_override_template
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

// ─── Ver chat link ────────────────────────────────────────────────────────────

function VerChatLink({ leadId }: { leadId: string }) {
  return (
    <Link
      href={`/chats?lead=${leadId}`}
      title="Ver conversación"
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
    >
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      Ver chat
    </Link>
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
  programados: ProgramadoRow[];
  enviados: EnviadoRow[];
  programadosError: string | null;
  enviadosError: string | null;
  templates: WhatsAppTemplate[];
  templatesError: string | null;
}

export function SeguimientosTable({
  programados,
  enviados,
  programadosError,
  enviadosError,
  templates,
  templatesError,
}: Props) {
  return (
    <div className="space-y-8">
      <Section
        title="Programados"
        count={programados.length}
        error={programadosError}
        empty="No hay seguimientos ni plantillas pendientes."
        defaultOpen
      >
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <Th>Lead</Th>
              <Th>Tipo</Th>
              <Th>Estado</Th>
              <Th>Último contacto</Th>
              <Th>Cuándo se envía</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {programados.map((row) => (
              <tr
                key={`${row.lead.id}-${row.tipo}`}
                className="hover:bg-zinc-50/50"
              >
                <Td>
                  <LeadCell lead={row.lead} />
                </Td>
                <Td>
                  <SeguimientoTipoBadge tipo={row.tipo} />
                </Td>
                <Td>
                  <ChatStateBadge state={row.lead.estado_chat} />
                </Td>
                <Td className="text-sm text-zinc-500">
                  {formatRelative(row.lead.last_seen_at)}
                </Td>
                <Td className="text-sm text-zinc-500">
                  {row.estimatedSendLabel}
                  {hasOverride(row.lead) && <PersonalizadoBadge />}
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {row.tipo === "seguimiento_24h" ? (
                      <CancelButton phone={row.lead.phone} />
                    ) : null}
                    <EditarMensajeButton
                      lead={row.lead}
                      tipo={row.tipo}
                      templates={templates}
                      templatesError={templatesError}
                    />
                    <VerChatLink leadId={row.lead.id} />
                  </div>
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
        empty="Todavía no se envió ningún seguimiento ni plantilla."
        defaultOpen
      >
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <Th>Lead</Th>
              <Th>Tipo</Th>
              <Th>Enviado el</Th>
              <Th>Último contacto</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {enviados.map((row) => (
              <tr
                key={`${row.lead.id}-${row.tipo}`}
                className="hover:bg-zinc-50/50"
              >
                <Td>
                  <LeadCell lead={row.lead} />
                </Td>
                <Td>
                  <SeguimientoTipoBadge tipo={row.tipo} />
                </Td>
                <Td className="text-sm text-zinc-600">
                  {formatAbsolute(row.sentAt)}
                </Td>
                <Td className="text-sm text-zinc-500">
                  {formatAbsolute(row.lead.last_seen_at)}
                </Td>
                <Td>
                  <VerChatLink leadId={row.lead.id} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
