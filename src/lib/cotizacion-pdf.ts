import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Cotizacion } from "./types";
import { formatCLP, numeroCotizacion, subtotalItem } from "./cotizacion";

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 48;
const INK = rgb(0.094, 0.094, 0.106); // zinc-900
const MUTED = rgb(0.443, 0.443, 0.478); // zinc-500
const LINE = rgb(0.894, 0.894, 0.906); // zinc-200
const HEAD_BG = rgb(0.98, 0.98, 0.98); // zinc-50
const BRAND_RED = rgb(0.878, 0.188, 0.243);
const BRAND_NAVY = rgb(0.114, 0.239, 0.62);
const BRAND_SKY = rgb(0.122, 0.702, 0.902);

/** Las fuentes estándar de PDF solo codifican WinAnsi: normalizo comillas/guiones y saco lo que no entra. */
function winAnsi(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\t/g, " ")
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of winAnsi(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // Palabra más larga que la columna: la corto a mano.
      let rest = word;
      while (font.widthOfTextAtSize(rest, size) > maxWidth) {
        let n = rest.length - 1;
        while (n > 1 && font.widthOfTextAtSize(rest.slice(0, n), size) > maxWidth) n--;
        lines.push(rest.slice(0, n));
        rest = rest.slice(n);
      }
      line = rest;
    }
    lines.push(line);
  }
  return lines;
}

function fechaCorta(date: Date): string {
  return date.toLocaleDateString("es-CL", { timeZone: "America/Santiago" });
}

interface Empresa {
  nombre: string;
  lineas: string[];
}

function empresaDesdeEnv(): Empresa {
  return {
    nombre: process.env.EMPRESA_NOMBRE || "Jotamotors",
    lineas: [
      process.env.EMPRESA_DIRECCION,
      process.env.EMPRESA_TELEFONO,
      process.env.EMPRESA_EMAIL,
    ].filter((l): l is string => Boolean(l)),
  };
}

export async function buildCotizacionPdf(cot: Cotizacion): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const logo = await doc.embedJpg(await readFile(join(process.cwd(), "public", "logo-jotamotors.jpeg")));
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const empresa = empresaDesdeEnv();
  const numero = numeroCotizacion(cot.numero);
  doc.setTitle(`Cotización ${numero}`);
  doc.setAuthor(empresa.nombre);

  let page: PDFPage = doc.addPage(A4);
  const width = A4[0] - MARGIN * 2;
  let y = A4[1] - MARGIN;

  const text = (s: string, x: number, yy: number, opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}) =>
    page.drawText(winAnsi(s), { x, y: yy, font: opts.font ?? regular, size: opts.size ?? 10, color: opts.color ?? INK });
  const textRight = (s: string, right: number, yy: number, font: PDFFont = regular, size = 10, color = INK) =>
    text(s, right - font.widthOfTextAtSize(winAnsi(s), size), yy, { font, size, color });
  const hr = (yy: number) =>
    page.drawLine({ start: { x: MARGIN, y: yy }, end: { x: MARGIN + width, y: yy }, thickness: 0.75, color: LINE });

  // Encabezado
  const creada = new Date(cot.created_at);
  const vence = new Date(creada.getTime() + cot.validez_dias * 86_400_000);
  const logoSize = 44;
  page.drawImage(logo, { x: MARGIN, y: y - logoSize, width: logoSize, height: logoSize });
  const empresaX = MARGIN + logoSize + 12;
  text(empresa.nombre, empresaX, y - 16, { font: bold, size: 20 });
  empresa.lineas.forEach((l, i) => text(l, empresaX, y - 34 - i * 13, { size: 9, color: MUTED }));
  const right = MARGIN + width;
  textRight("COTIZACIÓN", right, y - 14, bold, 14);
  textRight(numero, right, y - 30, regular, 10, MUTED);
  textRight(`Fecha: ${fechaCorta(creada)}`, right, y - 44, regular, 9, MUTED);
  textRight(`Válida hasta: ${fechaCorta(vence)}`, right, y - 57, regular, 9, MUTED);
  y -= Math.max(70, 44 + empresa.lineas.length * 13);
  const stripeY = y + 1;
  const stripeWidth = width / 3;
  page.drawRectangle({ x: MARGIN, y: stripeY, width: stripeWidth, height: 2, color: BRAND_RED });
  page.drawRectangle({ x: MARGIN + stripeWidth, y: stripeY, width: stripeWidth, height: 2, color: BRAND_NAVY });
  page.drawRectangle({ x: MARGIN + stripeWidth * 2, y: stripeY, width: width - stripeWidth * 2, height: 2, color: BRAND_SKY });
  hr(y);
  y -= 22;

  // Cliente y vehículo
  const col2 = MARGIN + width / 2;
  text("CLIENTE", MARGIN, y, { font: bold, size: 8, color: MUTED });
  if (cot.vehiculo || cot.patente) text("VEHÍCULO", col2, y, { font: bold, size: 8, color: MUTED });
  y -= 15;
  const clienteLineas = [cot.cliente_nombre, cot.cliente_email, cot.cliente_telefono].filter(Boolean) as string[];
  const vehiculoLineas = [cot.vehiculo, cot.patente ? `Patente: ${cot.patente}` : null].filter(Boolean) as string[];
  clienteLineas.forEach((l, i) => text(l, MARGIN, y - i * 14, { font: i === 0 ? bold : regular }));
  vehiculoLineas.forEach((l, i) => text(l, col2, y - i * 14, { font: i === 0 ? bold : regular }));
  y -= Math.max(clienteLineas.length, vehiculoLineas.length) * 14 + 16;

  // Tabla de ítems
  const cols = { cant: MARGIN + width * 0.62, precio: MARGIN + width * 0.8, subtotal: right };
  const descWidth = width * 0.55 - 8;
  const drawHead = () => {
    page.drawRectangle({ x: MARGIN, y: y - 8, width, height: 24, color: HEAD_BG });
    text("DESCRIPCIÓN", MARGIN + 8, y, { font: bold, size: 8, color: MUTED });
    textRight("CANT.", cols.cant, y, bold, 8, MUTED);
    textRight("PRECIO UNIT.", cols.precio, y, bold, 8, MUTED);
    textRight("SUBTOTAL", cols.subtotal - 8, y, bold, 8, MUTED);
    y -= 26;
  };
  const ensureSpace = (needed: number, withHead: boolean) => {
    if (y - needed >= MARGIN + 20) return;
    page = doc.addPage(A4);
    y = A4[1] - MARGIN;
    if (withHead) drawHead();
  };

  drawHead();
  for (const it of cot.items) {
    const lines = wrap(it.descripcion, regular, 10, descWidth);
    const rowHeight = lines.length * 13 + 10;
    ensureSpace(rowHeight, true);
    lines.forEach((l, i) => text(l, MARGIN + 8, y - i * 13));
    textRight(String(it.cantidad).replace(".", ","), cols.cant, y);
    textRight(formatCLP(it.precio_unitario), cols.precio, y);
    textRight(formatCLP(subtotalItem(it)), cols.subtotal - 8, y);
    y -= rowHeight - 4;
    hr(y + 6);
    y -= 6;
  }

  // Total
  ensureSpace(40, false);
  y -= 10;
  textRight("TOTAL", cols.precio, y, bold, 11);
  textRight(formatCLP(cot.total), cols.subtotal - 8, y, bold, 13);
  y -= 34;

  // Observaciones
  if (cot.observaciones) {
    const lines = wrap(cot.observaciones, regular, 9, width);
    ensureSpace(20 + lines.length * 12, false);
    text("OBSERVACIONES", MARGIN, y, { font: bold, size: 8, color: MUTED });
    y -= 15;
    for (const l of lines) {
      ensureSpace(12, false);
      text(l, MARGIN, y, { size: 9 });
      y -= 12;
    }
  }

  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const footer = winAnsi(`${numero} · Página ${i + 1} de ${pages.length}`);
    p.drawText(footer, {
      x: A4[0] - MARGIN - regular.widthOfTextAtSize(footer, 8),
      y: MARGIN / 2,
      font: regular,
      size: 8,
      color: MUTED,
    });
  });

  return doc.save();
}
