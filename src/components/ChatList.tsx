import Link from "next/link";
import type { Lead } from "@/lib/types";

function formatPhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function initials(lead: Lead): string {
  const name = lead.name?.trim();
  if (!name) return "#";
  return name
    .split(/\s+/)
    .map((p) => p.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "#";
}

interface ChatListProps {
  leads: Lead[];
  activeId: string | null;
}

export function ChatList({ leads, activeId }: ChatListProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-200/80 bg-white">
      <div className="border-b border-zinc-200 px-4 py-4">
        <h2 className="section-title">Conversaciones</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          {leads.length} {leads.length === 1 ? "contacto" : "contactos"}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {leads.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-zinc-500">
            No hay conversaciones todavía.
          </p>
        ) : (
          leads.map((lead) => {
            const active = lead.id === activeId;
            const displayName = lead.name ?? formatPhone(lead.phone);
            return (
              <Link
                key={lead.id}
                href={`/chats?lead=${lead.id}`}
                className={
                  active
                    ? "relative flex items-center gap-3 border-b border-zinc-100 bg-brand-50/60 px-4 py-3"
                    : "relative flex items-center gap-3 border-b border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50"
                }
              >
                {active && (
                  <span className="m-stripe-v absolute inset-y-0 left-0 w-[3px]" />
                )}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${
                    active ? "bg-ink-900 text-white" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {initials(lead)}
                </div>
                <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {displayName}
                  </p>
                  <span className="shrink-0 text-[11px] text-zinc-500">
                    {formatRelative(lead.last_seen_at)}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {lead.message_count}{" "}
                  {lead.message_count === 1 ? "mensaje" : "mensajes"}
                  {" · "}
                  {lead.source === "meta_ads" ? "Meta Ads" : "Orgánico"}
                </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
