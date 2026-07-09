"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const IconLeads = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconChats = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconTurnos = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconEnvios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconGraficos = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconSeguimientos = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const items: NavItem[] = [
  { href: "/", label: "Leads", icon: <IconLeads /> },
  { href: "/chats", label: "Chats", icon: <IconChats /> },
  { href: "/turnos", label: "Turnos", icon: <IconTurnos /> },
  { href: "/envios", label: "Envíos", icon: <IconEnvios /> },
  { href: "/seguimientos", label: "Seguimientos", icon: <IconSeguimientos /> },
  { href: "/graficos", label: "Gráficos", icon: <IconGraficos /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-100 bg-white">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-900">
              Jotamotors
            </h1>
            <p className="text-xs text-zinc-400">CRM WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="mx-3 h-px bg-zinc-100" />

      <nav className="flex flex-1 flex-col gap-0.5 p-3 pt-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Secciones
        </p>
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                active
                  ? "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold bg-zinc-900 text-white transition-all duration-150"
                  : "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition-all duration-150 hover:bg-zinc-50 hover:text-zinc-900"
              }
            >
              <span
                className={
                  active
                    ? "text-white transition-colors"
                    : "text-zinc-400 transition-colors group-hover:text-zinc-700"
                }
              >
                {it.icon}
              </span>
              <span className="flex-1">{it.label}</span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs text-zinc-400">Sistema activo</span>
        </div>
      </div>
    </aside>
  );
}
