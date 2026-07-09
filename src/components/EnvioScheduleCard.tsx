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
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">
          Horario del envío automático diario
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          La plantilla de seguimiento se envía todos los días a las{" "}
          <span className="font-medium text-zinc-700">
            {formatHour(savedHour)} hs
          </span>{" "}
          (hora Argentina).
        </p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-800 disabled:opacity-50"
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
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
