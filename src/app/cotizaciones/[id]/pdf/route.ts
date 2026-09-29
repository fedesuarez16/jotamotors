import { getSupabaseServer } from "@/lib/supabase";
import { buildCotizacionPdf } from "@/lib/cotizacion-pdf";
import { numeroCotizacion } from "@/lib/cotizacion";
import type { Cotizacion } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("cotizaciones").select("*").eq("id", id).maybeSingle();
  if (error) return new Response(error.message, { status: 500 });
  if (!data) return new Response("Cotización no encontrada", { status: 404 });

  const cot = data as Cotizacion;
  const pdf = await buildCotizacionPdf(cot);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${numeroCotizacion(cot.numero)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
