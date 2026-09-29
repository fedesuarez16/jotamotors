"use client";

import { useState, useTransition } from "react";
import {
  bulkSendTemplateAction,
  listApprovedTemplatesAction,
  scheduleBulkSendAction,
  type WhatsAppTemplate,
} from "@/app/actions";

type SendPhase =
  | "idle"
  | "loading-templates"
  | "confirming"
  | "sending"
  | { scheduledFor: string }
  | { sent: number; failed: number; failures: { phone: string; error: string }[] };

interface BulkSendButtonProps {
  selectedIds: string[];
}

// Valor mínimo para el input datetime-local, en hora local del navegador.
function nowLocalValue(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function BulkSendButton({ selectedIds }: BulkSendButtonProps) {
  const [phase, setPhase] = useState<SendPhase>("idle");
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
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
      setScheduleAt("");
      setPhase("confirming");
    });
  };

  const send = () => {
    if (!selectedTemplate) return;
    const template = {
      name: selectedTemplate.name,
      language: selectedTemplate.language,
    };

    if (scheduleAt) {
      const scheduledDate = new Date(scheduleAt);
      if (scheduledDate.getTime() <= Date.now()) {
        window.alert("La fecha programada debe ser futura.");
        return;
      }
      setPhase("sending");
      startTransition(async () => {
        const result = await scheduleBulkSendAction(
          selectedIds,
          template,
          scheduledDate.toISOString()
        );
        if (!result.ok) {
          window.alert(`Error: ${result.error}`);
          setPhase("confirming");
          return;
        }
        setPhase({ scheduledFor: scheduledDate.toISOString() });
      });
      return;
    }

    setPhase("sending");
    startTransition(async () => {
      const result = await bulkSendTemplateAction(selectedIds, template);
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
        className="btn btn-sm bg-brand-600 text-white hover:bg-brand-500"
      >
        Envío masivo
      </button>
    );
  }

  if (phase === "loading-templates") {
    return (
      <span className="text-xs font-medium text-zinc-300">
        Cargando plantillas
        <span className="inline-block animate-pulse">...</span>
      </span>
    );
  }

  if (phase === "confirming") {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <select
          value={selectedTemplate?.name ?? ""}
          onChange={(e) =>
            setSelectedTemplate(
              templates.find((t) => t.name === e.target.value) ?? null
            )
          }
          title={selectedTemplate?.bodyText}
          className="max-w-56 rounded-lg border border-white/15 bg-ink-800 px-2 py-1.5 text-xs text-white focus:border-brand-500 focus:outline-none"
        >
          {templates.map((t) => (
            <option key={t.name} value={t.name} title={t.bodyText}>
              {t.name} ({t.language})
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-300">
          a {selectedIds.length} contacto{selectedIds.length === 1 ? "" : "s"}
        </span>
        <input
          type="datetime-local"
          value={scheduleAt}
          min={nowLocalValue()}
          onChange={(e) => setScheduleAt(e.target.value)}
          title="Dejalo vacío para enviar ahora"
          className="rounded-lg border border-white/15 bg-ink-800 px-2 py-1 text-xs text-white focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!selectedTemplate}
          className="btn btn-sm bg-brand-600 text-white hover:bg-brand-500"
        >
          {scheduleAt ? "Programar" : "Enviar ahora"}
        </button>
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className="btn btn-sm text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          Cancelar
        </button>
      </span>
    );
  }

  if (phase === "sending") {
    return (
      <span className="text-xs font-medium text-zinc-300">
        {scheduleAt ? "Programando" : "Enviando"}{" "}
        <span className="inline-block animate-pulse">...</span>
      </span>
    );
  }

  if ("scheduledFor" in phase) {
    return (
      <span className="flex items-center gap-3">
        <span className="text-xs font-medium text-emerald-300">
          Programado para el{" "}
          {new Date(phase.scheduledFor).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className="btn btn-sm text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          OK
        </button>
      </span>
    );
  }

  // Result phase
  const { sent, failed, failures } = phase;
  return (
    <span className="flex items-center gap-3">
      <span className="text-xs font-medium text-emerald-300">
        {sent} {sent === 1 ? "enviado" : "enviados"}
      </span>
      {failed > 0 && (
        <span
          title={failures.map((f) => `${f.phone}: ${f.error}`).join("\n")}
          className="cursor-help text-xs font-medium text-red-300 underline decoration-dotted"
        >
          {failed} {failed === 1 ? "fallido" : "fallidos"}
        </span>
      )}
      <button
        type="button"
        onClick={() => setPhase("idle")}
        className="btn btn-sm text-zinc-400 hover:bg-white/10 hover:text-white"
      >
        OK
      </button>
    </span>
  );
}
