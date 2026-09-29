import type { CotizacionInput, CotizacionItem } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult =
  | { ok: true; value: CotizacionInput & { total: number } }
  | { ok: false; error: string };

function clean(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  return v === "" ? null : v;
}

/** Normaliza y valida lo que llega del formulario. Montos en CLP enteros, sin IVA. */
export function validarCotizacion(input: CotizacionInput): ValidationResult {
  const cliente_nombre = clean(input.cliente_nombre);
  const cliente_email = clean(input.cliente_email)?.toLowerCase() ?? null;
  if (!cliente_nombre) return { ok: false, error: "Falta el nombre del cliente" };
  if (!cliente_email || !EMAIL_RE.test(cliente_email))
    return { ok: false, error: "Email del cliente inválido" };

  const items: CotizacionItem[] = [];
  for (const [i, it] of (input.items ?? []).entries()) {
    const descripcion = clean(it.descripcion);
    if (!descripcion) continue;
    const cantidad = Number(it.cantidad);
    const precio_unitario = Math.round(Number(it.precio_unitario));
    if (!Number.isFinite(cantidad) || cantidad <= 0)
      return { ok: false, error: `Cantidad inválida en el ítem ${i + 1}` };
    if (!Number.isFinite(precio_unitario) || precio_unitario < 0)
      return { ok: false, error: `Precio inválido en el ítem ${i + 1}` };
    items.push({ descripcion, cantidad, precio_unitario });
  }
  if (items.length === 0) return { ok: false, error: "Agregá al menos un ítem" };

  const validez_dias = Math.trunc(Number(input.validez_dias ?? 15));
  if (!Number.isFinite(validez_dias) || validez_dias < 1)
    return { ok: false, error: "Validez inválida" };

  return {
    ok: true,
    value: {
      cliente_id: input.cliente_id ?? null,
      cliente_nombre,
      cliente_email,
      cliente_telefono: clean(input.cliente_telefono),
      vehiculo: clean(input.vehiculo),
      patente: clean(input.patente)?.toUpperCase() ?? null,
      items,
      validez_dias,
      observaciones: clean(input.observaciones),
      total: calcularTotal(items),
    },
  };
}

export function subtotalItem(it: CotizacionItem): number {
  return Math.round(it.cantidad * it.precio_unitario);
}

export function calcularTotal(items: CotizacionItem[]): number {
  return items.reduce((acc, it) => acc + subtotalItem(it), 0);
}

export function formatCLP(value: number): string {
  return `$${Math.round(value).toLocaleString("es-CL")}`;
}

export function numeroCotizacion(numero: number): string {
  return `COT-${String(numero).padStart(5, "0")}`;
}
