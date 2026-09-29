"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type {
  EnviadoRow,
  Lead,
  NoEnviadoRow,
  ProgramadoRow,
} from "@/lib/types";
import type { WhatsAppTemplate } from "@/app/actions";
import {
  ChatStateBadge,
  PersonalizadoBadge,
  SeguimientoTipoBadge,
  SourceBadge,
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

function hasOverride(lead: Lead): boolean {
  return Boolean(
    lead.seguimiento_override_texto || lead.seguimiento_override_template
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
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
      className="shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LeadCell({ lead }: { lead: Lead }) {
  return (
    <div>
      <p className="text-sm font-medium text-ink-900">
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
      className="btn btn-sm text-zinc-500 hover:bg-zinc-100 hover:text-ink-900"
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
      className="btn btn-sm text-zinc-500 hover:bg-red-50 hover:text-red-600"
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
  tone = "default",
  defaultOpen = true,
  children,
}: {
  title: string;
  count: number;
  error: string | null;
  empty: string;
  tone?: "default" | "alert";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const countStyles =
    tone === "alert" && count > 0
      ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
      : "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200";

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
        <h2 className="section-title">{title}</h2>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${countStyles}`}
        >
          {count}
        </span>
      </button>

      {open && (
        <>
          {error ? (
            <div className="alert-error">
              <p className="text-sm font-medium text-red-800">
                No se pudo cargar esta sección
              </p>
              <p className="mt-1 font-mono text-xs text-red-600">{error}</p>
            </div>
          ) : count === 0 ? (
            <div className="empty">
              <p className="text-sm text-zinc-500">{empty}</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
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
  noEnviados: NoEnviadoRow[];
  enviados: EnviadoRow[];
  programadosError: string | null;
  enviadosError: string | null;
  templates: WhatsAppTemplate[];
  templatesError: string | null;
}

export function SeguimientosTable({
  programados,
  noEnviados,
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
        <table className="table">
          <thead>
            <tr>
              <Th>Lead</Th>
              <Th>Tipo</Th>
              <Th>Estado</Th>
              <Th>Último contacto</Th>
              <Th>Cuándo se envía</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {programados.map((row) => (
              <tr
                key={`${row.lead.id}-${row.tipo}`}
               
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
        title="No enviados"
        count={noEnviados.length}
        error={programadosError}
        empty="Todo lo programado salió. Nada quedó sin enviar."
        tone="alert"
        defaultOpen
      >
        <table className="table">
          <thead>
            <tr>
              <Th>Lead</Th>
              <Th>Tipo</Th>
              <Th>Estado</Th>
              <Th>Debía salir</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {noEnviados.map((row) => (
              <tr
                key={`${row.lead.id}-${row.tipo}`}
                className="bg-red-50/30"
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
                <Td>
                  <span
                    title="El cron no lo tomó o YCloud rechazó el envío. No quedó registro del error."
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700"
                  >
                    <AlertIcon />
                    {row.expectedLabel}
                  </span>
                </Td>
                <Td>
                  <VerChatLink leadId={row.lead.id} />
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
        <table className="table">
          <thead>
            <tr>
              <Th>Lead</Th>
              <Th>Origen</Th>
              <Th>Tipo</Th>
              <Th>Enviado el</Th>
              <Th>Último contacto</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {enviados.map((row) => (
              <tr
                key={`${row.lead.id}-${row.tipo}`}
               
              >
                <Td>
                  <LeadCell lead={row.lead} />
                </Td>
                <Td>
                  <SourceBadge source={row.lead.source} />
                </Td>
                <Td>
                  <SeguimientoTipoBadge tipo={row.tipo} />
                </Td>
                <Td>
                  <span
                    title="Confirmado: YCloud aceptó el envío en esta fecha"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"
                  >
                    <CheckIcon />
                    {formatAbsolute(row.sentAt)}
                  </span>
                  <span className="ml-1 text-xs text-zinc-400">
                    ({formatRelative(row.sentAt)})
                  </span>
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
