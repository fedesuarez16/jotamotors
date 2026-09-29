"use client";

import { useState, useTransition } from "react";
import { setEnvioScheduleAction } from "@/app/actions";

interface EnvioScheduleCardProps {
  sendHour: number;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

export function EnvioScheduleCard({ sendHour }: EnvioScheduleCardProps) {
  const [hour, setHour] = useState(sendHour);
  const [savedHour, setSavedHour] = useState(sendHour);
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await setEnvioScheduleAction(hour);
      if (!result.ok) {
        window.alert(`Error: ${result.error}`);
        return;
      }
      setSavedHour(hour);
    });
  };

  const dirty = hour !== savedHour;

  return (
    <div className="card mb-8 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-m-sky">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
        <p className="section-title">
          Horario del envío automático diario
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          La plantilla de seguimiento se envía todos los días a las{" "}
          <span className="font-semibold text-ink-900">
            {formatHour(savedHour)} hs
          </span>{" "}
          (hora Argentina).
        </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          disabled={pending}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {formatHour(h)} hs
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="btn btn-brand btn-sm"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
