"use client";

import { useEffect, useState, useTransition } from "react";
import type { Lead, SeguimientoTipo } from "@/lib/types";
import type { WhatsAppTemplate } from "@/app/actions";
import { setSeguimientoOverrideAction } from "@/app/actions/seguimientos";

const DEFAULT_TEXTO =
  "Hola! retomaba contacto para saber si te puedo ayudar con algo mas?";

interface Props {
  lead: Lead;
  tipo: SeguimientoTipo;
  templates: WhatsAppTemplate[];
  templatesError: string | null;
}

export function EditarMensajeButton({
  lead,
  tipo,
  templates,
  templatesError,
}: Props) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState(lead.seguimiento_override_texto ?? "");
  const [templateName, setTemplateName] = useState(
    lead.seguimiento_override_template ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const openModal = () => {
    setTexto(lead.seguimiento_override_texto ?? "");
    setTemplateName(lead.seguimiento_override_template ?? "");
    setError(null);
    setOpen(true);
  };

  const selectedTemplate =
    templates.find((t) => t.name === templateName) ?? null;

  const save = () => {
    setError(null);
    startTransition(async () => {
      const payload =
        tipo === "seguimiento_24h"
          ? {
              texto: texto.trim() === "" ? null : texto.trim(),
              template: templateName === "" ? null : templateName,
              templateLang:
                templateName === "" ? null : selectedTemplate?.language ?? null,
            }
          : {
              template: templateName === "" ? null : templateName,
              templateLang:
                templateName === "" ? null : selectedTemplate?.language ?? null,
            };
      const result = await setSeguimientoOverrideAction(lead.id, payload);
      if (!result.ok) {
        setError(result.error ?? "Error desconocido");
        return;
      }
      setOpen(false);
    });
  };

  const reset = () => {
    setError(null);
    startTransition(async () => {
      const payload =
        tipo === "seguimiento_24h"
          ? { texto: null, template: null, templateLang: null }
          : { template: null, templateLang: null };
      const result = await setSeguimientoOverrideAction(lead.id, payload);
      if (!result.ok) {
        setError(result.error ?? "Error desconocido");
        return;
      }
      setTexto("");
      setTemplateName("");
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        title="Editar mensaje"
        className="btn btn-sm text-zinc-500 hover:bg-brand-50 hover:text-brand-700"
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
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
        Editar mensaje
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 px-4 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="m-stripe h-1 w-full" />
            <div className="p-6">
            <h3 className="font-display text-lg font-semibold text-ink-900">
              Editar mensaje — {lead.name ?? lead.phone}
            </h3>

            {tipo === "seguimiento_24h" && (
              <div className="mt-4">
                <label className="label">
                  Texto (si el lead está dentro de las 24hs)
                </label>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={DEFAULT_TEXTO}
                  rows={3}
                  maxLength={1000}
                  className="input mt-1"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="label">
                Plantilla (si quedó fuera de la ventana)
              </label>
              {templatesError ? (
                <p className="mt-1 text-xs text-red-600">{templatesError}</p>
              ) : (
                <select
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="input mt-1"
                >
                  <option value="">(default)</option>
                  {templates.map((t) => (
                    <option key={t.name} value={t.name} title={t.bodyText}>
                      {t.name} ({t.language})
                    </option>
                  ))}
                </select>
              )}
              {tipo === "plantilla" && (
                <p className="mt-1 text-xs text-zinc-500">
                  Fuera de la ventana de 24hs solo se pueden enviar
                  plantillas aprobadas por Meta.
                </p>
              )}
            </div>

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="btn btn-ghost btn-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={isPending}
                className="btn btn-secondary btn-sm"
              >
                Restablecer
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                className="btn btn-primary btn-sm"
              >
                {isPending ? "…" : "Guardar"}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
