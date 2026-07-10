"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Lead } from "@/lib/types";
import { BulkActionsBar } from "./BulkActionsBar";
import { ChatStateToggle } from "./ChatStateToggle";
import { DeleteLeadButton } from "./DeleteLeadButton";
import { InlineAdSourceId } from "./InlineAdSourceId";
import { InlineSelect } from "./InlineSelect";
import { LeadSidebar } from "./LeadSidebar";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

interface LeadsTableProps {
  leads: Lead[];
  followupIds: string[];
}

const SOURCE_OPTIONS = [
  { value: "meta_ads", label: "Meta Ads" },
  { value: "organic", label: "Orgánico" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "Nuevo" },
  { value: "engaged", label: "En conversación" },
  { value: "qualified", label: "Calificado" },
  { value: "booked", label: "Turno tomado" },
  { value: "closed", label: "Cerrado" },
];

export function LeadsTable({ leads, followupIds }: LeadsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sidebarLeadId, setSidebarLeadId] = useState<string | null>(null);
  const followupSet = useMemo(() => new Set(followupIds), [followupIds]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const sidebarLead = leads.find((l) => l.id === sidebarLeadId) ?? null;

  useEffect(() => {
    const stillValid = new Set<string>();
    const leadIds = new Set(leads.map((l) => l.id));
    for (const id of selected) {
      if (leadIds.has(id)) stillValid.add(id);
    }
    if (stillValid.size !== selected.size) setSelected(stillValid);
  }, [leads, selected]);

  const allChecked = leads.length > 0 && selected.size === leads.length;
  const someChecked = selected.size > 0 && !allChecked;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === leads.length ? new Set() : new Set(leads.map((l) => l.id))
    );
  };

  const clear = () => setSelected(new Set());

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No hay leads para mostrar todavía.
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Cuando llegue el primer mensaje al webhook de WhatsApp, aparece acá.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <BulkActionsBar selectedIds={Array.from(selected)} onDone={clear} />

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <Th className="w-10">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Seleccionar todos"
                  className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
              </Th>
              <Th>Nombre</Th>
              <Th>Teléfono</Th>
              <Th>Origen</Th>
              <Th>Tag / Ad ID</Th>
              <Th>Estado</Th>
              <Th>Chat</Th>
              <Th className="text-right">Mensajes</Th>
              <Th>Primer contacto</Th>
              <Th>Último contacto</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {leads.map((lead) => {
              const isSelected = selected.has(lead.id);
              const inFollowup = followupSet.has(lead.id);
              return (
                <tr
                  key={lead.id}
                  onClick={() => setSidebarLeadId(lead.id)}
                  className={
                    isSelected
                      ? "cursor-pointer bg-blue-50/60 dark:bg-blue-950/20"
                      : "cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                  }
                >
                  <Td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(lead.id)}
                      aria-label={`Seleccionar ${lead.name ?? formatPhone(lead.phone)}`}
                      className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {lead.name ? (
                        <span className="font-medium">{lead.name}</span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600">
                          —
                        </span>
                      )}
                      {inFollowup && (
                        <span
                          title="En seguimiento"
                          className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                          Seg.
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-sm">
                      {formatPhone(lead.phone)}
                    </span>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <InlineSelect
                      leadId={lead.id}
                      field="source"
                      current={lead.source}
                      options={SOURCE_OPTIONS}
                    />
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <InlineAdSourceId
                      leadId={lead.id}
                      value={lead.ad_source_id}
                    />
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <InlineSelect
                      leadId={lead.id}
                      field="status"
                      current={lead.status}
                      options={STATUS_OPTIONS}
                    />
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <ChatStateToggle
                      phone={lead.phone}
                      currentState={lead.estado_chat}
                    />
                  </Td>
                  <Td className="text-right tabular-nums">
                    {lead.message_count}
                  </Td>
                  <Td className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(lead.first_seen_at)}
                  </Td>
                  <Td className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(lead.last_seen_at)}
                  </Td>
                  <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/chats?lead=${lead.id}`}
                        className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900/50 dark:bg-zinc-950 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                        aria-label={`Ver chat de ${lead.name ?? formatPhone(lead.phone)}`}
                      >
                        Ver chat
                      </Link>
                      <DeleteLeadButton
                        id={lead.id}
                        label={lead.name ?? formatPhone(lead.phone)}
                      />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sidebarLead && (
        <LeadSidebar
          lead={sidebarLead}
          inFollowup={followupSet.has(sidebarLead.id)}
          onClose={() => setSidebarLeadId(null)}
        />
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
}) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 ${className}`}
      onClick={onClick}
    >
      {children}
    </td>
  );
}
