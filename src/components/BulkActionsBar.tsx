"use client";

import { useState, useTransition } from "react";
import type { ChatState } from "@/lib/types";
import {
  type ActionResult,
  bulkAddFollowupAction,
  bulkDeleteLeadsAction,
  bulkRemoveFollowupAction,
  bulkSetChatStateAction,
} from "@/app/actions";
import { BulkSendButton } from "./BulkSendButton";

interface BulkActionsBarProps {
  selectedIds: string[];
  onDone: () => void;
}

const chatStateOptions: { value: ChatState; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "cerrado", label: "Cerrado" },
];

export function BulkActionsBar({ selectedIds, onDone }: BulkActionsBarProps) {
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  const run = (fn: () => Promise<ActionResult>) => {
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        window.alert(`Error: ${result.error}`);
        return;
      }
      onDone();
    });
  };

  const handleDelete = () => {
    const n = selectedIds.length;
    const ok = window.confirm(
      `¿Borrar ${n} lead${n === 1 ? "" : "s"} y todos sus mensajes? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    run(() => bulkDeleteLeadsAction(selectedIds));
  };

  const handleChatState = (state: ChatState) => {
    setMenuOpen(false);
    run(() => bulkSetChatStateAction(selectedIds, state));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
      <span className="text-sm font-medium text-blue-900">
        {selectedIds.length} seleccionado
        {selectedIds.length === 1 ? "" : "s"}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => run(() => bulkAddFollowupAction(selectedIds))}
          disabled={pending}
          className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar a seguimiento
        </button>

        <button
          type="button"
          onClick={() => run(() => bulkRemoveFollowupAction(selectedIds))}
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Quitar de seguimiento
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((s) => !s)}
            disabled={pending}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            Cambiar estado chat ▾
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
            >
              {chatStateOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitem"
                  onClick={() => handleChatState(opt.value)}
                  disabled={pending}
                  className="block w-full px-3 py-1.5 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Borrar
        </button>

        <div className="h-5 w-px bg-blue-200" aria-hidden />

        <BulkSendButton selectedIds={selectedIds} />

        <div className="h-5 w-px bg-blue-200" aria-hidden />

        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
