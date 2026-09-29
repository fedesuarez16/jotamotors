"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase";
import { sendMail } from "@/lib/mailer";
import { buildCotizacionPdf } from "@/lib/cotizacion-pdf";
import { formatCLP, numeroCotizacion, validarCotizacion } from "@/lib/cotizacion";
import type { Cliente, Cotizacion, CotizacionInput } from "@/lib/types";

export type ActionResult =
  | { ok: true; id: string; numero: number; enviada: boolean }
  | { ok: false; error: string; id?: string };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function enviarPorMail(cot: Cotizacion): Promise<string | null> {
  const numero = numeroCotizacion(cot.numero);
  const empresa = process.env.EMPRESA_NOMBRE || "Jotamotors";
  try {
    const pdf = await buildCotizacionPdf(cot);
    const saludo = `Hola ${cot.cliente_nombre},`;
    const cuerpo = `Te enviamos adjunta la cotización ${numero} por un total de ${formatCLP(cot.total)}, válida por ${cot.validez_dias} días.`;
    await sendMail({
      to: cot.cliente_email,
      subject: `Cotización ${numero} - ${empresa}`,
      text: `${saludo}\n\n${cuerpo}\n\nQuedamos atentos a cualquier consulta.\n\n${empresa}`,
      html: `<p>${escapeHtml(saludo)}</p><p>${escapeHtml(cuerpo)}</p><p>Quedamos atentos a cualquier consulta.</p><p><strong>${escapeHtml(empresa)}</strong></p>`,
      attachments: [{ filename: `${numero}.pdf`, content: pdf, contentType: "application/pdf" }],
    });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Error desconocido al enviar";
  }
}

async function marcarResultado(id: string, error: string | null) {
  const supabase = getSupabaseServer();
  await supabase
    .from("cotizaciones")
    .update(
      error
        ? { estado: "error", error }
        : { estado: "enviada", enviada_at: new Date().toISOString(), error: null }
    )
    .eq("id", id);
}

/** Guarda la cotización y, si `enviar`, genera el PDF y lo manda por mail. */
export async function guardarCotizacionAction(
  input: CotizacionInput,
  enviar: boolean
): Promise<ActionResult> {
  const valid = validarCotizacion(input);
  if (!valid.ok) return valid;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("cotizaciones")
    .insert(valid.value)
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };
  const cot = data as Cotizacion;

  if (!enviar) {
    revalidatePath("/cotizaciones");
    return { ok: true, id: cot.id, numero: cot.numero, enviada: false };
  }

  const mailError = await enviarPorMail(cot);
  await marcarResultado(cot.id, mailError);
  revalidatePath("/cotizaciones");
  if (mailError)
    return { ok: false, id: cot.id, error: `Se guardó ${numeroCotizacion(cot.numero)} pero falló el envío: ${mailError}` };
  return { ok: true, id: cot.id, numero: cot.numero, enviada: true };
}

export async function enviarCotizacionAction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "id requerido" };
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("cotizaciones").select("*").eq("id", id).single();
  if (error) return { ok: false, error: error.message };
  const cot = data as Cotizacion;

  const mailError = await enviarPorMail(cot);
  await marcarResultado(cot.id, mailError);
  revalidatePath("/cotizaciones");
  if (mailError) return { ok: false, id, error: mailError };
  return { ok: true, id, numero: cot.numero, enviada: true };
}

export type ClienteSugerido = Pick<Cliente, "id" | "nombre" | "apellido" | "apellido_materno" | "email" | "telefono">;

export async function buscarClientesAction(q: string): Promise<ClienteSugerido[]> {
  const term = (q ?? "").replace(/[,()*%]/g, " ").trim();
  if (term.length < 2) return [];
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre, apellido, apellido_materno, email, telefono")
    .or(["nombre", "apellido", "email", "telefono"].map((c) => `${c}.ilike.%${term}%`).join(","))
    .limit(8);
  if (error) return [];
  return (data ?? []) as ClienteSugerido[];
}
