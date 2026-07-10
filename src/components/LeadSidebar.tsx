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
    <div className="fixed inset-0 z-50 bg-zinc-900/40" onClick={onClose}>
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto border-l border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {lead.name ?? "Sin nombre"}
            </h2>
            <p className="mt-0.5 font-mono text-sm text-zinc-500 dark:text-zinc-400">
              {formatPhone(lead.phone)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900"
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

        <div className="mt-3 flex items-center gap-2">
          <ChatStateBadge state={lead.estado_chat} />
          <SourceBadge source={lead.source} />
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Primer contacto
            </dt>
            <dd className="text-zinc-700 dark:text-zinc-300">
              {formatDate(lead.first_seen_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Último contacto
            </dt>
            <dd className="text-zinc-700 dark:text-zinc-300">
              {formatDate(lead.last_seen_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Mensajes
            </dt>
            <dd className="text-zinc-700 dark:text-zinc-300">
              {lead.message_count}
            </dd>
          </div>
        </dl>

        {(lead.ad_headline || lead.ad_body) && (
          <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Aviso de origen
            </p>
            {lead.ad_headline && (
              <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {lead.ad_headline}
              </p>
            )}
            {lead.ad_body && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {lead.ad_body}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Seguimiento
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {seguimientoStatus}
          </p>
          {hasOverride(lead) && (
            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              Mensaje personalizado
            </p>
          )}

          <div className="mt-3">
            {disabledReason ? (
              <div>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {inFollowup ? "Quitar de seguimiento" : "Agregar a seguimiento"}
                </button>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
                    ? "w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    : "w-full rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-900/50 dark:bg-zinc-950 dark:text-amber-400 dark:hover:bg-amber-950/30"
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

        <div className="mt-5">
          <Link
            href={`/chats?lead=${lead.id}`}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900"
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
        </div>
      </div>
    </div>
  );
}
