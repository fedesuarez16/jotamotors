"use client";

import Link from "next/link";
import { useEffect, useTransition } from "react";
import type { Lead } from "@/lib/types";
import { bulkAddFollowupAction, bulkRemoveFollowupAction } from "@/app/actions";
import { ChatStateBadge, SourceBadge } from "@/components/Badge";

interface LeadSidebarProps {
  lead: Lead;
  inFollowup: boolean;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function initials(lead: Lead): string {
  const source = lead.name?.trim();
  if (!source) return "#";
  const parts = source.split(/\s+/).map((p) => p.replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "#";
}

function hasOverride(lead: Lead): boolean {
  return Boolean(
    lead.seguimiento_override_texto || lead.seguimiento_override_template
  );
}

export function LeadSidebar({ lead, inFollowup, onClose }: LeadSidebarProps) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const disabledReason = lead.seguimiento_enviado_at
    ? "Ya se le envió el seguimiento."
    : lead.seguimiento_cancelado_at
      ? "El seguimiento fue cancelado."
      : null;

  const toggleFollowup = () => {
    startTransition(async () => {
      const result = inFollowup
        ? await bulkRemoveFollowupAction([lead.id])
        : await bulkAddFollowupAction([lead.id]);
      if (!result.ok) {
        window.alert(`Error: ${result.error}`);
      }
    });
  };

  let seguimientoStatus: string;
  if (lead.seguimiento_enviado_at) {
    seguimientoStatus = `Seguimiento enviado el ${formatDate(lead.seguimiento_enviado_at)}`;
  } else if (lead.seguimiento_cancelado_at) {
    seguimientoStatus = "Seguimiento cancelado";
  } else if (inFollowup) {
    seguimientoStatus = "En seguimiento";
  } else {
    seguimientoStatus = "Sin seguimiento";
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto bg-white shadow-2xl sm:w-[420px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="m-stripe h-1 w-full shrink-0" />
        <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-lg font-semibold text-white">
              {initials(lead)}
            </div>
            <div>
            <h2 className="font-display text-xl font-semibold leading-tight text-ink-900">
              {lead.name ?? "Sin nombre"}
            </h2>
            <p className="mt-0.5 font-mono text-sm text-zinc-500">
              {formatPhone(lead.phone)}
            </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="btn-ghost btn p-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <ChatStateBadge state={lead.estado_chat} />
          <SourceBadge source={lead.source} />
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl bg-zinc-50 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Primer contacto
            </dt>
            <dd className="mt-1 text-xs font-medium text-ink-900">
              {formatDate(lead.first_seen_at)}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Último contacto
            </dt>
            <dd className="mt-1 text-xs font-medium text-ink-900">
              {formatDate(lead.last_seen_at)}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Mensajes
            </dt>
            <dd className="mt-1 text-xs font-medium text-ink-900">
              {lead.message_count}
            </dd>
          </div>
        </dl>

        {(lead.ad_headline || lead.ad_body) && (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Aviso de origen
            </p>
            {lead.ad_headline && (
              <p className="mt-1 text-sm font-medium text-ink-900">
                {lead.ad_headline}
              </p>
            )}
            {lead.ad_body && (
              <p className="mt-1 text-sm text-zinc-600">
                {lead.ad_body}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 rounded-xl border border-zinc-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Seguimiento
          </p>
          <p className="mt-1 text-sm text-zinc-700">
            {seguimientoStatus}
          </p>
          {hasOverride(lead) && (
            <p className="mt-1 text-xs font-medium text-brand-700">
              Mensaje personalizado
            </p>
          )}

          <div className="mt-3">
            {disabledReason ? (
              <div>
                <button
                  type="button"
                  disabled
                  className="btn btn-secondary w-full"
                >
                  {inFollowup ? "Quitar de seguimiento" : "Agregar a seguimiento"}
                </button>
                <p className="mt-1 text-xs text-zinc-500">
                  {disabledReason}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleFollowup}
                disabled={isPending}
                className={
                  inFollowup
                    ? "btn btn-secondary w-full"
                    : "btn btn-brand w-full"
                }
              >
                {isPending
                  ? "…"
                  : inFollowup
                    ? "Quitar de seguimiento"
                    : "Agregar a seguimiento"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Link
            href={`/chats?lead=${lead.id}`}
            className="btn btn-primary w-full py-2.5"
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
            Ver conversación
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
