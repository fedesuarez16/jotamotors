import type { Lead, Message } from "@/lib/types";
import { SourceBadge, StatusBadge } from "./Badge";

function formatPhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatDayHeader(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface ChatThreadProps {
  lead: Lead | null;
  messages: Message[];
}

export function ChatThread({ lead, messages }: ChatThreadProps) {
  if (!lead) {
    return (
      <section className="flex flex-1 items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-700">
            Seleccioná una conversación
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Elegí un contacto en la lista de la izquierda.
          </p>
        </div>
      </section>
    );
  }

  let lastDay: string | null = null;

  return (
    <section className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-zinc-900">
              {lead.name ?? formatPhone(lead.phone)}
            </h2>
            <p className="mt-0.5 truncate font-mono text-xs text-zinc-500">
              {formatPhone(lead.phone)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SourceBadge source={lead.source} />
            <StatusBadge status={lead.status} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            Esta conversación todavía no tiene mensajes guardados.
          </p>
        ) : (
          <ol className="space-y-1">
            {messages.map((m) => {
              const k = dayKey(m.created_at);
              const showDay = k !== lastDay;
              lastDay = k;
              const isOut = m.direction === "outbound";
              return (
                <li key={m.id}>
                  {showDay && (
                    <div className="my-3 flex justify-center">
                      <span className="rounded-full bg-zinc-200 px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                        {formatDayHeader(m.created_at)}
                      </span>
                    </div>
                  )}
                  <div
                    className={
                      isOut
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        isOut
                          ? "max-w-md rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2 text-sm text-white shadow-sm"
                          : "max-w-md rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-sm text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                      }
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {m.body}
                      </p>
                      <p
                        className={
                          isOut
                            ? "mt-1 text-right text-[10px] text-blue-100"
                            : "mt-1 text-right text-[10px] text-zinc-400"
                        }
                      >
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
