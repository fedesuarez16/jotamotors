"use client";

import { useTransition } from "react";
import type { ChatState } from "@/lib/types";
import { setChatStateAction } from "@/app/actions/chat-state";

const OPTIONS: { value: ChatState; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "cerrado", label: "Cerrado" },
  { value: "inactivo", label: "Inactivo" },
];

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
      className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 shadow-sm transition-opacity disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
    >
      {OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
