"use client";

import { useTransition } from "react";
import { updateLeadFieldAction } from "@/app/actions";

interface Option {
  value: string;
  label: string;
}

interface InlineSelectProps {
  leadId: string;
  field: "source" | "status";
  current: string;
  options: Option[];
}

export function InlineSelect({
  leadId,
  field,
  current,
  options,
}: InlineSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value;
    if (newVal === current) return;

    startTransition(async () => {
      const result = await updateLeadFieldAction(leadId, field, newVal);
      if (!result.ok) {
        window.alert(`Error al guardar: ${result.error}`);
      }
    });
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={isPending}
      className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 shadow-sm transition-opacity disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
