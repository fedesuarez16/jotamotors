"use server";

import { revalidatePath } from "next/cache";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
    const logo = await readFile(join(process.cwd(), "public", "logo-jotamotors.jpeg"));
    const saludo = `Hola ${cot.cliente_nombre},`;
    const total = formatCLP(cot.total);
    const vigencia = `${cot.validez_dias} días`;
    const cuerpo = `Te compartimos la cotización ${numero} por un total de ${total}. La propuesta es válida por ${vigencia}. Encontrarás el detalle completo en el PDF adjunto.`;
    await sendMail({
      to: cot.cliente_email,
      subject: `Cotización ${numero} - ${empresa}`,
      text: `${saludo}\n\n${cuerpo}\n\nSi tienes alguna consulta, responde a este correo.\n\n${empresa}`,
      html: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:28px 12px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#202124;">
          <tr><td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;">
              <tr>
                <td style="padding:20px 24px;background-color:#16181d;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td width="68" valign="middle"><img src="cid:logo@jotamotors" width="60" height="60" alt="Jotamotors" style="display:block;width:60px;height:60px;border:0;border-radius:8px;" /></td>
                    <td valign="middle" style="padding-left:14px;color:#ffffff;">
                      <div style="font-size:17px;font-weight:700;letter-spacing:.2px;">${escapeHtml(empresa)}</div>
                      <div style="padding-top:4px;font-size:10px;letter-spacing:1.5px;color:#b9bdc6;">SERVICIO AUTOMOTRIZ</div>
                    </td>
                    <td align="right" valign="middle" style="color:#d1d5db;font-size:11px;line-height:1.6;white-space:nowrap;">COTIZACIÓN<br /><strong style="color:#ffffff;font-size:13px;">${escapeHtml(numero)}</strong></td>
                  </tr></table>
                </td>
              </tr>
              <tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="33.33%" height="3" style="height:3px;background-color:#e0303e;"></td><td width="33.33%" height="3" style="height:3px;background-color:#1d3d9e;"></td><td width="33.34%" height="3" style="height:3px;background-color:#1fb3e6;"></td></tr></table></td></tr>
              <tr><td style="padding:30px 32px 22px;">
                <p style="margin:0 0 12px;font-size:16px;line-height:1.5;font-weight:700;color:#16181d;">${escapeHtml(saludo)}</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#525866;">Te compartimos la cotización solicitada. El detalle de los trabajos y repuestos está en el PDF adjunto.</p>
              </td></tr>
              <tr><td style="padding:0 32px 26px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e7e9ed;border-radius:9px;background-color:#f8f9fb;">
                  <tr><td style="padding:17px 18px;">
                    <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;color:#737987;">TOTAL COTIZADO</div>
                    <div style="padding-top:5px;font-size:25px;line-height:1.2;font-weight:700;letter-spacing:-.4px;color:#16181d;">${escapeHtml(total)}</div>
                  </td><td align="right" style="padding:17px 18px;">
                    <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#737987;">VIGENCIA</div>
                    <div style="padding-top:7px;font-size:13px;font-weight:600;color:#30343b;">${escapeHtml(vigencia)}</div>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td style="padding:0 32px 26px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="padding:5px 8px;border-radius:4px;background-color:#fff0f0;color:#c62835;font-size:10px;font-weight:700;letter-spacing:.5px;">PDF</td>
                  <td style="padding-left:9px;color:#737987;font-size:12px;">Cotización adjunta a este correo</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:18px 32px 22px;border-top:1px solid #eceef1;background-color:#fcfcfd;">
                <p style="margin:0;color:#626875;font-size:12px;line-height:1.7;">Si tienes alguna consulta, responde a este correo y te ayudamos.</p>
                <p style="margin:8px 0 0;color:#16181d;font-size:12px;font-weight:700;">${escapeHtml(empresa)}</p>
              </td></tr>
            </table>
          </td></tr>
        </table>`,
      attachments: [
        { filename: `${numero}.pdf`, content: pdf, contentType: "application/pdf" },
        { filename: "logo-jotamotors.jpeg", content: logo, contentType: "image/jpeg", cid: "logo@jotamotors" },
      ],
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
