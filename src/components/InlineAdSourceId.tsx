"use client";

import { useRef, useState, useTransition } from "react";
import { updateLeadFieldAction } from "@/app/actions";

interface InlineAdSourceIdProps {
  leadId: string;
  value: string | null;
}

export function InlineAdSourceId({ leadId, value }: InlineAdSourceIdProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(value ?? "");
    setEditing(true);
    // wait one tick for the input to mount
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function save() {
    const newVal = draft.trim() || null;
    if (newVal === value) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await updateLeadFieldAction(leadId, "ad_source_id", newVal);
      if (!result.ok) {
        window.alert(`Error al guardar: ${result.error}`);
      }
      setEditing(false);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        placeholder="Ad ID…"
        className="w-36 rounded-lg border border-brand-500 bg-white px-2 py-1 font-mono text-xs text-zinc-700 outline-none ring-2 ring-brand-500/20 transition-opacity disabled:opacity-50"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Clic para editar"
      className="group flex items-center gap-1 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-zinc-100"
    >
      {value ? (
        <span className="font-mono text-xs text-zinc-600">
          {value}
        </span>
      ) : (
        <span className="text-zinc-300">—</span>
      )}
      <span className="text-[10px] opacity-0 transition-opacity group-hover:opacity-50">
        ✎
      </span>
    </button>
  );
}
