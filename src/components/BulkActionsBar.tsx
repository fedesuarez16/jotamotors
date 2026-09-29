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
    <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-900 px-4 py-2.5 text-white shadow-lg shadow-ink-900/20">
      <span className="flex items-center gap-2 text-sm font-medium text-white">
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-ink-900">
          {selectedIds.length}
        </span>
        seleccionado{selectedIds.length === 1 ? "" : "s"}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => run(() => bulkAddFollowupAction(selectedIds))}
          disabled={pending}
          className="btn btn-sm bg-white/10 text-white hover:bg-white/20"
        >
          Agregar a seguimiento
        </button>

        <button
          type="button"
          onClick={() => run(() => bulkRemoveFollowupAction(selectedIds))}
          disabled={pending}
          className="btn btn-sm bg-white/10 text-white hover:bg-white/20"
        >
          Quitar de seguimiento
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((s) => !s)}
            disabled={pending}
            className="btn btn-sm bg-white/10 text-white hover:bg-white/20"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            Cambiar estado chat ▾
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-10 mt-1.5 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl"
            >
              {chatStateOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitem"
                  onClick={() => handleChatState(opt.value)}
                  disabled={pending}
                  className="block w-full px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="btn btn-sm bg-red-500/15 text-red-300 hover:bg-red-500/25"
        >
          Borrar
        </button>

        <div className="h-5 w-px bg-white/15" aria-hidden />

        <BulkSendButton selectedIds={selectedIds} />

        <div className="h-5 w-px bg-white/15" aria-hidden />

        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="btn btn-sm text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
