"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { csvToClientes } from "@/lib/clientes-csv";
import { importClientesAction, revalidateClientesAction } from "./actions";

const BATCH_SIZE = 500;

type Status =
  | { kind: "idle" }
  | { kind: "running"; done: number; total: number }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

export function ClientesImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const router = useRouter();

  async function handleFile(file: File) {
    const { clientes, total, descartados, duplicados } = csvToClientes(await file.text());
    if (clientes.length === 0) {
      setStatus({ kind: "error", message: "El archivo no tiene filas válidas." });
      return;
    }

    setStatus({ kind: "running", done: 0, total: clientes.length });
    for (let i = 0; i < clientes.length; i += BATCH_SIZE) {
      const res = await importClientesAction(clientes.slice(i, i + BATCH_SIZE));
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: `Falló el lote que empieza en la fila ${i + 1}: ${res.error}. Se importaron ${i} antes del error.`,
        });
        return;
      }
      setStatus({ kind: "running", done: i + res.count, total: clientes.length });
    }

    await revalidateClientesAction();
    router.refresh();
    setStatus({
      kind: "done",
      message: `Importados ${clientes.length} de ${total} filas` +
        (duplicados ? ` · ${duplicados} emails duplicados unificados` : "") +
        (descartados ? ` · ${descartados} filas vacías descartadas` : ""),
    });
  }

  const running = status.kind === "running";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={running}
        onClick={() => inputRef.current?.click()}
        className="btn btn-primary"
      >
        {running ? "Importando…" : "Importar CSV"}
      </button>
      {status.kind === "running" && (
        <span className="text-xs tabular-nums text-zinc-500">
          {status.done} / {status.total}
        </span>
      )}
      {status.kind === "done" && (
        <span className="text-xs text-emerald-700">{status.message}</span>
      )}
      {status.kind === "error" && (
        <span className="text-xs text-red-700">{status.message}</span>
      )}
    </div>
  );
}
