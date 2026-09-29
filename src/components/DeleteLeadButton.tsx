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
      className="btn btn-danger btn-sm"
      aria-label={`Borrar lead ${label}`}
    >
      {pending ? "Borrando..." : "Borrar"}
    </button>
  );
}
