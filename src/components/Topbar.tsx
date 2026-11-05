"use client";

import { usePathname } from "next/navigation";
import { TOGGLE_SIDEBAR_EVENT } from "./Sidebar";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/": { title: "Leads", description: "Contactos que entraron por WhatsApp" },
  "/chats": { title: "Chats", description: "Conversaciones activas" },
  "/turnos": { title: "Turnos", description: "Solicitudes de turno" },
  "/clientes": { title: "Clientes", description: "Listado de clientes importado" },
  "/cotizaciones": { title: "Cotizaciones", description: "Generar y enviar cotizaciones en PDF" },
  "/envios": { title: "Envíos", description: "Historial de envíos masivos" },
  "/seguimientos": { title: "Seguimientos", description: "Follow-ups automáticos Meta Ads" },
  "/graficos": { title: "Gráficos", description: "Estadísticas y tendencias" },
};

function getPageMeta(pathname: string) {
  if (pathname === "/") return PAGE_META["/"];
  for (const [key, meta] of Object.entries(PAGE_META)) {
    if (key !== "/" && pathname.startsWith(key)) return meta;
  }
  return { title: "CRM", description: "" };
}

function useFormattedDate(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
}

export function Topbar() {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const dateStr = useFormattedDate();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => window.dispatchEvent(new Event(TOGGLE_SIDEBAR_EVENT))}
          className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-semibold leading-tight tracking-tight text-ink-900">
            {meta.title}
          </h1>
          {meta.description && (
            <p className="truncate text-xs text-zinc-500">{meta.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 first-letter:uppercase sm:block">
            {dateStr}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 ring-2 ring-white shadow-sm">
            <span className="font-display text-xs font-bold leading-none tracking-wide text-white">
              JM
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
