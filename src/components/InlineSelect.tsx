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
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white py-1 pl-2 pr-7 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
