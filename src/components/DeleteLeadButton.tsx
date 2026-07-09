"use client";

import { useTransition } from "react";
import { deleteLeadAction } from "@/app/actions";

interface DeleteLeadButtonProps {
  id: string;
  label: string;
}

export function DeleteLeadButton({ id, label }: DeleteLeadButtonProps) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    const ok = window.confirm(
      `¿Borrar lead ${label}?\n\nSe eliminan también todos sus mensajes. Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteLeadAction(id);
      if (!result.ok) {
        window.alert(`Error al borrar: ${result.error}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
      aria-label={`Borrar lead ${label}`}
    >
      {pending ? "Borrando..." : "Borrar"}
    </button>
  );
}
