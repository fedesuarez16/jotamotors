import type { ClienteInput } from "./types";

/** RFC 4180 CSV parser: soporta comillas, comillas escapadas ("") y saltos de línea dentro de campos. */
export function parseCsv(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

type Campo = Exclude<keyof ClienteInput, "extra">;

const HEADER_MAP: Record<string, Campo> = {
  nombre: "nombre",
  apellido: "apellido",
  col_3: "apellido_materno",
  "apellido materno": "apellido_materno",
  email: "email",
  "email 1": "email",
  "email 2": "email_2",
  telefono: "telefono",
  "telefono 1": "telefono",
  etiquetas: "etiquetas",
  "estado de suscriptor por email": "estado_email",
  "estado de suscriptor por sms": "estado_sms",
  "ultima actividad": "ultima_actividad",
  "fecha de la ultima actividad (utc+0)": "ultima_actividad_at",
  fuente: "fuente",
  idioma: "idioma",
  "creado a las (utc+0)": "creado_en_origen",
};

const DATE_FIELDS = new Set<Campo>(["ultima_actividad_at", "creado_en_origen"]);

/** "2025-01-02 05:56" (UTC) → ISO. Devuelve null si no es parseable. */
function toIsoUtc(value: string): string | null {
  const m = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?$/);
  if (!m) return null;
  return `${m[1]}T${m[2]}${m[3] ?? ":00"}Z`;
}

export interface ParseResult {
  clientes: ClienteInput[];
  total: number;
  descartados: number;
  duplicados: number;
}

/**
 * Convierte el CSV en filas para la tabla `clientes`.
 * Columnas conocidas van a su campo; las desconocidas se guardan en `extra`.
 * Dedupe por email (la última fila gana) para que el upsert no choque consigo mismo.
 */
export function csvToClientes(text: string): ParseResult {
  const [header, ...body] = parseCsv(text);
  if (!header) return { clientes: [], total: 0, descartados: 0, duplicados: 0 };

  const columns = header.map((h) => ({ raw: h.trim(), campo: HEADER_MAP[normalizeHeader(h)] }));
  const byEmail = new Map<string, ClienteInput>();
  const sinEmail: ClienteInput[] = [];
  let descartados = 0;

  for (const cells of body) {
    const cliente: ClienteInput = { extra: {} };
    columns.forEach((col, i) => {
      const value = (cells[i] ?? "").trim();
      if (!value) return;
      if (!col.campo) {
        cliente.extra[col.raw || `col_${i + 1}`] = value;
      } else if (DATE_FIELDS.has(col.campo)) {
        cliente[col.campo] = toIsoUtc(value);
      } else if (col.campo === "email") {
        cliente.email = value.toLowerCase();
      } else {
        cliente[col.campo] = value;
      }
    });

    if (!cliente.email && !cliente.telefono && !cliente.nombre) {
      descartados++;
      continue;
    }
    if (cliente.email) byEmail.set(cliente.email, cliente);
    else sinEmail.push(cliente);
  }

  const conEmail = body.length - descartados - sinEmail.length;
  return {
    clientes: [...byEmail.values(), ...sinEmail],
    total: body.length,
    descartados,
    duplicados: conEmail - byEmail.size,
  };
}
