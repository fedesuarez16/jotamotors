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

interface ChatListProps {
  leads: Lead[];
  activeId: string | null;
}

export function ChatList({ leads, activeId }: ChatListProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">Conversaciones</h2>
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
                    ? "block border-b border-zinc-100 bg-zinc-100 px-4 py-3"
                    : "block border-b border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50"
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-zinc-900">
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
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
