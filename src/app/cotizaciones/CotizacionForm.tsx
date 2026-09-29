"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { calcularTotal, formatCLP, numeroCotizacion } from "@/lib/cotizacion";
import { buscarClientesAction, guardarCotizacionAction, type ClienteSugerido } from "./actions";

interface ItemRow {
  key: number;
  descripcion: string;
  cantidad: number;
  precio: string; // solo dígitos
}

let nextKey = 1;
const emptyItem = (descripcion = ""): ItemRow => ({ key: nextKey++, descripcion, cantidad: 1, precio: "" });

const SERVICIOS_RAPIDOS = [
  "Cambio de aceite y filtro",
  "Pastillas de freno",
  "Mantención general",
  "Carga aire acondicionado",
  "Scanner / diagnóstico",
  "Mano de obra",
];

const VALIDEZ_OPCIONES = [7, 15, 30];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  "input py-2.5";
const labelCls = "label";

function nombreCompleto(c: ClienteSugerido): string {
  return [c.nombre, c.apellido, c.apellido_materno].filter(Boolean).join(" ");
}

function formatMiles(digits: string): string {
  return digits ? Number(digits).toLocaleString("es-CL") : "";
}

function fechaMasDias(dias: number): string {
  return new Date(Date.now() + dias * 86_400_000).toLocaleDateString("es-CL");
}

/* ---------- Iconos ---------- */

const Svg = ({ children, size = 16 }: { children: React.ReactNode; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconUser = () => <Svg><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>;
const IconCar = () => <Svg><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A2 2 0 0 0 13.7 6H7.3a2 2 0 0 0-1.6.8L3 10.5 1.6 11c-.4.2-.6.6-.6 1v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M9 17h6" /></Svg>;
const IconList = () => <Svg><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></Svg>;
const IconNote = () => <Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>;
const IconSearch = () => <Svg size={15}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Svg>;
const IconTrash = () => <Svg size={15}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></Svg>;
const IconPlus = () => <Svg size={15}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Svg>;
const IconSend = () => <Svg size={15}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Svg>;
const IconCheck = () => <Svg size={14}><polyline points="20 6 9 17 4 12" /></Svg>;
const IconX = () => <Svg size={14}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>;

/* ---------- Bloques ---------- */

function Card({ step, icon, title, hint, children }: { step: number; icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <header className="flex items-center gap-3 border-b border-zinc-100 px-6 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">{icon}</span>
        <div className="flex-1">
          <h3 className="section-title">{title}</h3>
          {hint && <p className="text-xs text-zinc-500">{hint}</p>}
        </div>
        <span className="font-display text-2xl font-semibold tabular-nums text-zinc-200">0{step}</span>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function ClienteBuscador({ onSelect }: { onSelect: (c: ClienteSugerido) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ClienteSugerido[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await buscarClientesAction(q);
      if (!cancelled) {
        setResults(r);
        setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const open = q.trim().length >= 2;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><IconSearch /></span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar cliente existente por nombre, email o teléfono…"
        className={`${inputCls} pl-9`}
      />
      {open && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
          {loading && results.length === 0 && <li className="px-4 py-3 text-sm text-zinc-400">Buscando…</li>}
          {!loading && results.length === 0 && <li className="px-4 py-3 text-sm text-zinc-400">Sin resultados — cargalo a mano abajo.</li>}
          {results.map((c) => {
            const nombre = nombreCompleto(c) || "—";
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50"
                  onClick={() => {
                    onSelect(c);
                    setQ("");
                  }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
                    {nombre.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-900">{nombre}</span>
                    <span className="block truncate text-xs text-zinc-500">{[c.email, c.telefono].filter(Boolean).join(" · ")}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CantidadStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const btn = "flex h-full w-7 items-center justify-center text-zinc-400 hover:text-ink-900 disabled:opacity-30";
  return (
    <div className="flex h-[42px] items-center rounded-lg border border-zinc-200 bg-white shadow-sm">
      <button type="button" className={btn} disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value.replace(/\D/g, ""), 10);
          onChange(Number.isFinite(n) && n > 0 ? n : 1);
        }}
        className="w-full min-w-0 bg-transparent text-center text-sm tabular-nums text-ink-900 focus:outline-none"
      />
      <button type="button" className={btn} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

/* ---------- Formulario ---------- */

export function CotizacionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"enviar" | "guardar" | null>(null);
  const [cliente, setCliente] = useState<ClienteSugerido | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [patente, setPatente] = useState("");
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [validez, setValidez] = useState(15);
  const [observaciones, setObservaciones] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const lastDescRef = useRef<HTMLInputElement>(null);
  const focusLast = useRef(false);

  useEffect(() => {
    if (focusLast.current) {
      lastDescRef.current?.focus();
      focusLast.current = false;
    }
  }, [items.length]);

  const parsedItems = items.map((it) => ({
    descripcion: it.descripcion,
    cantidad: it.cantidad,
    precio_unitario: Number(it.precio || 0),
  }));
  const itemsValidos = parsedItems.filter((it) => it.descripcion.trim());
  const total = calcularTotal(itemsValidos);

  const checks = [
    { ok: nombre.trim() !== "", label: "Nombre del cliente" },
    { ok: EMAIL_RE.test(email.trim()), label: "Email válido" },
    { ok: itemsValidos.length > 0, label: "Al menos un ítem" },
  ];
  const listo = checks.every((c) => c.ok);

  function updateItem(key: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function addItem(descripcion = "") {
    setItems((prev) => {
      const vacio = prev.find((it) => !it.descripcion.trim() && !it.precio);
      if (vacio && descripcion) return prev.map((it) => (it.key === vacio.key ? { ...it, descripcion } : it));
      focusLast.current = !descripcion;
      return [...prev, emptyItem(descripcion)];
    });
  }

  function reset() {
    setCliente(null);
    setNombre("");
    setEmail("");
    setTelefono("");
    setVehiculo("");
    setPatente("");
    setItems([emptyItem()]);
    setValidez(15);
    setObservaciones("");
  }

  function submit(enviar: boolean) {
    setResult(null);
    setPendingAction(enviar ? "enviar" : "guardar");
    startTransition(async () => {
      const res = await guardarCotizacionAction(
        {
          cliente_id: cliente?.id ?? null,
          cliente_nombre: nombre,
          cliente_email: email,
          cliente_telefono: telefono,
          vehiculo,
          patente,
          items: parsedItems,
          validez_dias: validez,
          observaciones,
        },
        enviar
      );
      if (res.ok) {
        const n = numeroCotizacion(res.numero);
        setResult({ ok: true, message: res.enviada ? `${n} enviada a ${email}` : `${n} guardada como borrador` });
        reset();
      } else {
        setResult({ ok: false, message: res.error });
        if (res.id) reset(); // quedó guardada: se puede reenviar desde el listado
      }
      setPendingAction(null);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Card step={1} icon={<IconUser />} title="Cliente" hint="Buscá en tu base o cargalo a mano">
          <ClienteBuscador
            onSelect={(c) => {
              setCliente(c);
              setNombre(nombreCompleto(c));
              setEmail(c.email ?? "");
              setTelefono(c.telefono ?? "");
            }}
          />
          {cliente && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <IconCheck />
              <span className="flex-1">Vinculada al cliente <strong>{nombreCompleto(cliente) || cliente.email}</strong></span>
              <button type="button" onClick={() => setCliente(null)} className="font-medium underline-offset-2 hover:underline">
                Desvincular
              </button>
            </div>
          )}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nombre completo *</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Raúl Ripol" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@correo.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 1234 5678" className={inputCls} />
            </div>
          </div>
        </Card>

        <Card step={2} icon={<IconCar />} title="Vehículo" hint="Opcional, aparece en el PDF">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div>
              <label className={labelCls}>Marca, modelo y año</label>
              <input value={vehiculo} onChange={(e) => setVehiculo(e.target.value)} placeholder="Ej: Toyota Yaris 2019" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Patente</label>
              <input
                value={patente}
                onChange={(e) => setPatente(e.target.value.toUpperCase().replace(/[^A-Z0-9·\- ]/g, ""))}
                maxLength={8}
                placeholder="AB·CD·12"
                className="w-full rounded-lg border-2 border-ink-900 bg-white px-3 py-2 text-center font-mono text-base font-bold tracking-[0.25em] text-ink-900 placeholder-zinc-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </Card>

        <Card step={3} icon={<IconList />} title="Ítems" hint="Valores en CLP, sin IVA">
          <div className="mb-5 flex flex-wrap gap-2">
            {SERVICIOS_RAPIDOS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addItem(s)}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-ink-900"
              >
                <IconPlus /> {s}
              </button>
            ))}
          </div>

          <div className="hidden grid-cols-[20px_minmax(0,1fr)_96px_128px_96px_32px] gap-2.5 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 md:grid">
            <span>#</span>
            <span>Descripción</span>
            <span className="text-center">Cant.</span>
            <span>Precio unit.</span>
            <span className="text-right">Subtotal</span>
            <span />
          </div>

          <div className="space-y-3 md:space-y-2">
            {items.map((it, i) => {
              const sub = it.cantidad * Number(it.precio || 0);
              return (
                <div
                  key={it.key}
                  className="group grid grid-cols-[minmax(0,1fr)_104px] items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 md:grid-cols-[20px_minmax(0,1fr)_96px_128px_96px_32px] md:gap-2.5 md:border-0 md:bg-transparent md:p-1"
                >
                  <span className="hidden text-xs tabular-nums text-zinc-400 md:block">{i + 1}</span>
                  <input
                    ref={i === items.length - 1 ? lastDescRef : undefined}
                    value={it.descripcion}
                    onChange={(e) => updateItem(it.key, { descripcion: e.target.value })}
                    placeholder="Descripción del trabajo o repuesto"
                    className={`${inputCls} col-span-2 md:col-span-1`}
                  />
                  <CantidadStepper value={it.cantidad} onChange={(v) => updateItem(it.key, { cantidad: v })} />
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <input
                      inputMode="numeric"
                      value={formatMiles(it.precio)}
                      onChange={(e) => updateItem(it.key, { precio: e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") })}
                      placeholder="0"
                      className={`${inputCls} pl-7 text-right tabular-nums`}
                    />
                  </div>
                  <span className="text-right text-sm font-semibold tabular-nums text-ink-900">{formatCLP(sub)}</span>
                  <button
                    type="button"
                    aria-label="Quitar ítem"
                    disabled={items.length === 1}
                    onClick={() => setItems((prev) => prev.filter((x) => x.key !== it.key))}
                    className="flex h-8 w-8 items-center justify-center justify-self-end rounded-lg text-zinc-300 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-0 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <IconTrash />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => addItem()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-3 text-sm font-medium text-zinc-500 transition hover:border-zinc-400 hover:text-ink-900"
          >
            <IconPlus /> Agregar ítem
          </button>
        </Card>

        <Card step={4} icon={<IconNote />} title="Observaciones" hint="Condiciones, plazos, garantía…">
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            placeholder="Ej: Trabajo estimado en 3 horas. Precios sujetos a disponibilidad de repuestos."
            className={`${inputCls} resize-y`}
          />
        </Card>
      </div>

      {/* Resumen */}
      <aside className="sticky top-20 overflow-hidden rounded-2xl bg-ink-900 text-zinc-300 shadow-xl">
        <div className="m-stripe h-1 w-full" />
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Resumen</p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-zinc-300">Nueva</span>
          </div>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500">Cliente</p>
              <p className="truncate font-medium text-white">{nombre || <span className="text-zinc-500">Sin definir</span>}</p>
              {email && <p className="truncate text-xs text-zinc-400">{email}</p>}
            </div>
            {(vehiculo || patente) && (
              <div>
                <p className="text-xs text-zinc-500">Vehículo</p>
                <p className="truncate text-white">
                  {vehiculo}
                  {patente && <span className="ml-2 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-ink-900">{patente}</span>}
                </p>
              </div>
            )}
            <div>
              <p className="mb-1.5 text-xs text-zinc-500">Ítems ({itemsValidos.length})</p>
              {itemsValidos.length === 0 ? (
                <p className="text-zinc-500">Todavía no hay ítems</p>
              ) : (
                <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                  {itemsValidos.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3 text-xs">
                      <span className="truncate text-zinc-300">
                        {it.cantidad > 1 && <span className="text-zinc-500">{it.cantidad}× </span>}
                        {it.descripcion}
                      </span>
                      <span className="shrink-0 tabular-nums text-zinc-400">{formatCLP(it.cantidad * it.precio_unitario)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 px-6 py-5">
          <p className="text-xs text-zinc-500">Total</p>
          <p className="mt-0.5 font-display text-4xl font-semibold tracking-tight tabular-nums text-white">{formatCLP(total)}</p>

          <p className="mt-5 mb-2 text-xs text-zinc-500">Validez</p>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1">
            {VALIDEZ_OPCIONES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setValidez(d)}
                className={
                  validez === d
                    ? "rounded-lg bg-white py-1.5 text-xs font-semibold text-ink-900"
                    : "rounded-lg py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
                }
              >
                {d} días
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">Válida hasta el {fechaMasDias(validez)}</p>

          <ul className="mt-5 space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className={`flex items-center gap-2 text-xs ${c.ok ? "text-emerald-400" : "text-zinc-500"}`}>
                {c.ok ? <IconCheck /> : <span className="flex h-3.5 w-3.5 items-center justify-center"><span className="h-1 w-1 rounded-full bg-zinc-600" /></span>}
                {c.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 bg-white/5 px-6 py-5">
          <button
            type="button"
            disabled={isPending || !listo}
            onClick={() => submit(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <IconSend />
            {pendingAction === "enviar" ? "Enviando…" : "Enviar por mail"}
          </button>
          <button
            type="button"
            disabled={isPending || !listo}
            onClick={() => submit(false)}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pendingAction === "guardar" ? "Guardando…" : "Guardar como borrador"}
          </button>

          {result && (
            <div
              className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs ${
                result.ok ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"
              }`}
            >
              <span className="mt-px shrink-0">{result.ok ? <IconCheck /> : <IconX />}</span>
              <span>{result.message}</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
