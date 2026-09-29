"use client";

import Image from "next/image";
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

const IconClientes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconCotizaciones = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
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
  { href: "/clientes", label: "Clientes", icon: <IconClientes /> },
  { href: "/cotizaciones", label: "Cotizaciones", icon: <IconCotizaciones /> },
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
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-ink-900 text-zinc-300">
      <div className="px-5 pb-5 pt-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
            <Image
              src="/logo-jotamotors.jpeg"
              alt="Jotamotors"
              fill
              sizes="44px"
              priority
              className="scale-[1.7] object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-none tracking-wide text-white">
              JOTAMOTORS
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              CRM Taller
            </p>
          </div>
        </Link>
        <div className="m-stripe mt-5 h-[3px] w-full rounded-full opacity-90" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3 pt-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
          Menú
        </p>
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "group relative flex items-center gap-3 rounded-lg bg-white/[0.07] px-3 py-2.5 text-sm font-semibold text-white"
                  : "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:bg-white/[0.04] hover:text-zinc-100"
              }
            >
              {active && (
                <span className="m-stripe-v absolute inset-y-2 left-0 w-[3px] rounded-full" />
              )}
              <span
                className={
                  active
                    ? "text-m-sky"
                    : "text-zinc-500 transition-colors group-hover:text-zinc-300"
                }
              >
                {it.icon}
              </span>
              <span className="flex-1">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs text-zinc-500">Sistema activo</span>
        </div>
      </div>
    </aside>
  );
}
