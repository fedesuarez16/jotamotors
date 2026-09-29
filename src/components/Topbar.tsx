"use client";

import { usePathname } from "next/navigation";

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

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold leading-tight tracking-tight text-ink-900">
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
