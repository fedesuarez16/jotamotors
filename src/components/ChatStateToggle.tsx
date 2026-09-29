"use client";

import { useTransition } from "react";
import type { ChatState } from "@/lib/types";
import { setChatStateAction } from "@/app/actions/chat-state";

const OPTIONS: { value: ChatState; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "cerrado", label: "Cerrado" },
  { value: "inactivo", label: "Inactivo" },
];

const STATE_STYLES: Record<ChatState, string> = {
  activo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cerrado: "border-red-200 bg-red-50 text-red-700",
  inactivo: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

interface ChatStateToggleProps {
  phone: string;
  currentState: ChatState;
}

export function ChatStateToggle({ phone, currentState }: ChatStateToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newState = e.target.value as ChatState;
    if (newState === currentState) return;

    startTransition(async () => {
      const result = await setChatStateAction(phone, newState);
      if (!result.ok) {
        window.alert(`Error al cambiar estado: ${result.error}`);
      }
    });
  }

  return (
    <select
      value={currentState}
      onChange={handleChange}
      disabled={isPending}
      className={`cursor-pointer rounded-full border py-1 pl-2.5 pr-7 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 ${STATE_STYLES[currentState]}`}
    >
      {OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
