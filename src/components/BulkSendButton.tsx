"use client";

import { useState, useTransition } from "react";
import {
  bulkSendTemplateAction,
  listApprovedTemplatesAction,
  type WhatsAppTemplate,
} from "@/app/actions";

type SendPhase =
  | "idle"
  | "loading-templates"
  | "confirming"
  | "sending"
  | { sent: number; failed: number; failures: { phone: string; error: string }[] };

interface BulkSendButtonProps {
  selectedIds: string[];
}

export function BulkSendButton({ selectedIds }: BulkSendButtonProps) {
  const [phase, setPhase] = useState<SendPhase>("idle");
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [, startTransition] = useTransition();

  const loadTemplates = () => {
    setPhase("loading-templates");
    startTransition(async () => {
      const result = await listApprovedTemplatesAction();
      if (!result.ok) {
        window.alert(`Error cargando plantillas: ${result.error}`);
        setPhase("idle");
        return;
      }
      if (result.templates.length === 0) {
        window.alert("No hay plantillas aprobadas en YCloud.");
        setPhase("idle");
        return;
      }
      setTemplates(result.templates);
      setSelectedTemplate(result.templates[0]);
      setPhase("confirming");
    });
  };

  const send = () => {
    if (!selectedTemplate) return;
    setPhase("sending");
    startTransition(async () => {
      const result = await bulkSendTemplateAction(selectedIds, {
        name: selectedTemplate.name,
        language: selectedTemplate.language,
      });
      if (!result.ok) {
        window.alert(`Error: ${result.error}`);
        setPhase("idle");
        return;
      }
      setPhase({
        sent: result.sent,
        failed: result.failed,
        failures: result.failures,
      });
    });
  };

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={loadTemplates}
        className="rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
      >
        Envío masivo
      </button>
    );
  }

  if (phase === "loading-templates") {
    return (
      <span className="text-xs font-medium text-zinc-600">
        Cargando plantillas
        <span className="inline-block animate-pulse">...</span>
      </span>
    );
  }

  if (phase === "confirming") {
    return (
      <span className="flex items-center gap-2">
        <select
          value={selectedTemplate?.name ?? ""}
          onChange={(e) =>
            setSelectedTemplate(
              templates.find((t) => t.name === e.target.value) ?? null
            )
          }
          title={selectedTemplate?.bodyText}
          className="max-w-56 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-800"
        >
          {templates.map((t) => (
            <option key={t.name} value={t.name} title={t.bodyText}>
              {t.name} ({t.language})
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-700">
          a {selectedIds.length} contacto{selectedIds.length === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={send}
          disabled={!selectedTemplate}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-white"
        >
          Cancelar
        </button>
      </span>
    );
  }

  if (phase === "sending") {
    return (
      <span className="text-xs font-medium text-zinc-600">
        Enviando{" "}
        <span className="inline-block animate-pulse">...</span>
      </span>
    );
  }

  // Result phase
  const { sent, failed, failures } = phase;
  return (
    <span className="flex items-center gap-3">
      <span className="text-xs font-medium text-green-700">
        {sent} {sent === 1 ? "enviado" : "enviados"}
      </span>
      {failed > 0 && (
        <span
          title={failures.map((f) => `${f.phone}: ${f.error}`).join("\n")}
          className="cursor-help text-xs font-medium text-red-600 underline decoration-dotted"
        >
          {failed} {failed === 1 ? "fallido" : "fallidos"}
        </span>
      )}
      <button
        type="button"
        onClick={() => setPhase("idle")}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-white"
      >
        OK
      </button>
    </span>
  );
}
