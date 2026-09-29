"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enviarCotizacionAction } from "./actions";

export function EnviarButton({ id, label }: { id: string; label: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await enviarCotizacionAction(id);
            if (!res.ok) setError(res.error);
            router.refresh();
          });
        }}
        className="chip disabled:opacity-50"
      >
        {isPending ? "Enviando…" : label}
      </button>
      {error && <span className="max-w-[200px] truncate text-xs text-red-600" title={error}>{error}</span>}
    </span>
  );
}
