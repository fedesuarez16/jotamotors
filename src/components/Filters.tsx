"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChatStateFilter, SourceFilter } from "@/lib/types";

const sourceOptions: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Fuente: Todos" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "organic", label: "Orgánico" },
];

const chatOptions: { value: ChatStateFilter; label: string }[] = [
  { value: "all", label: "Estado: Todos" },
  { value: "activo", label: "Activos" },
  { value: "inactivo", label: "Inactivos" },
  { value: "cerrado", label: "Cerrados" },
];

function buildHref(
  params: URLSearchParams,
  key: string,
  value: string | null
): string {
  const next = new URLSearchParams(params);
  if (value === null) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-50"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Dropdown<T extends string>({
  options,
  value,
  paramKey,
  allValue,
  clearOnAll = true,
}: {
  options: { value: T; label: string }[];
  value: T;
  paramKey: string;
  allValue: T;
  clearOnAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`btn ${value === allValue ? "btn-secondary" : "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"}`}
      >
        {current.label}
        <ChevronDown />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 min-w-[170px] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                router.push(
                  buildHref(
                    params,
                    paramKey,
                    opt.value === allValue && clearOnAll ? null : opt.value
                  )
                );
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                opt.value === value
                  ? "font-medium text-ink-900"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span className="w-3 text-xs text-brand-600">{opt.value === value ? "✓" : ""}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SourceFilterDropdown({ active }: { active: SourceFilter }) {
  return (
    <Dropdown
      options={sourceOptions}
      value={active}
      paramKey="source"
      allValue="all"
      clearOnAll={false}
    />
  );
}

export function ChatStateFilterDropdown({ active }: { active: ChatStateFilter }) {
  return (
    <Dropdown
      options={chatOptions}
      value={active}
      paramKey="chat"
      allValue="all"
    />
  );
}

export function SearchBar() {
  const params = useSearchParams();
  const router = useRouter();
  const currentQ = params.get("q") ?? "";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const onClear = () => {
    const next = new URLSearchParams(params);
    next.delete("q");
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-1 items-center gap-2" role="search">
      <div className="relative flex-1">
        <svg
          aria-hidden
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          key={currentQ}
          type="search"
          name="q"
          defaultValue={currentQ}
          placeholder="Buscar por nombre o teléfono..."
          aria-label="Buscar lead"
          className="input pl-9 pr-8"
        />
        {currentQ && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary"
      >
        Buscar
      </button>
    </form>
  );
}
