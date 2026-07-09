"use client";

import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/": { title: "Leads", description: "Contactos que entraron por WhatsApp" },
  "/chats": { title: "Chats", description: "Conversaciones activas" },
  "/turnos": { title: "Turnos", description: "Solicitudes de turno" },
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
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">{meta.title}</h2>
        {meta.description && (
          <>
            <span className="text-zinc-300" aria-hidden>
              /
            </span>
            <span className="text-sm text-zinc-400">{meta.description}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm capitalize text-zinc-400 sm:block">
          {dateStr}
        </span>
        <div className="h-px w-px sm:h-4 sm:w-px sm:bg-zinc-200" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900">
          <span className="text-xs font-bold leading-none text-white">JM</span>
        </div>
      </div>
    </header>
  );
}
