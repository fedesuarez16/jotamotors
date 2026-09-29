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
      <div className="empty">
        <p className="font-display text-base font-semibold text-ink-900">
          No hay leads para mostrar
        </p>
        <p className="text-sm text-zinc-500">
          Cuando llegue el primer mensaje al webhook de WhatsApp, aparece acá.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <BulkActionsBar selectedIds={Array.from(selected)} onDone={clear} />

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <Th className="w-10">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Seleccionar todos"
                  className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-brand-600"
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
          <tbody>
            {leads.map((lead) => {
              const isSelected = selected.has(lead.id);
              const inFollowup = followupSet.has(lead.id);
              return (
                <tr
                  key={lead.id}
                  onClick={() => setSidebarLeadId(lead.id)}
                  className={
                    isSelected
                      ? "cursor-pointer bg-brand-50/70 hover:bg-brand-50"
                      : "cursor-pointer"
                  }
                >
                  <Td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(lead.id)}
                      aria-label={`Seleccionar ${lead.name ?? formatPhone(lead.phone)}`}
                      className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-brand-600"
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {lead.name ? (
                        <span className="font-medium text-ink-900">{lead.name}</span>
                      ) : (
                        <span className="text-zinc-300">
                          —
                        </span>
                      )}
                      {inFollowup && (
                        <span
                          title="En seguimiento"
                          className="rounded-full bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                        >
                          Seg.
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-[13px] text-zinc-600">
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
                  <Td className="text-right font-medium tabular-nums text-ink-900">
                    {lead.message_count}
                  </Td>
                  <Td className="text-xs text-zinc-500">
                    {formatDate(lead.first_seen_at)}
                  </Td>
                  <Td className="text-xs text-zinc-500">
                    {formatDate(lead.last_seen_at)}
                  </Td>
                  <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/chats?lead=${lead.id}`}
                        className="btn btn-secondary btn-sm"
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
      className={className}
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
      className={`whitespace-nowrap ${className}`}
      onClick={onClick}
    >
      {children}
    </td>
  );
}
