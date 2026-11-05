// Sesión simple de un solo usuario: la cookie guarda un HMAC del usuario
// firmado con AUTH_SECRET. Usa Web Crypto para correr en middleware (edge) y en Node.

export const SESSION_COOKIE = "jm_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const encoder = new TextEncoder();

async function hmac(value: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está configurado");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function createSessionToken(): Promise<string> {
  return hmac(`session:${process.env.CRM_USER ?? ""}`);
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  return safeEqual(token, await createSessionToken());
}

export async function checkCredentials(user: string, password: string): Promise<boolean> {
  const expectedUser = process.env.CRM_USER;
  const expectedPassword = process.env.CRM_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;
  // Comparar HMACs evita filtrar longitud/contenido por timing.
  const [u1, u2, p1, p2] = await Promise.all([
    hmac(user),
    hmac(expectedUser),
    hmac(password),
    hmac(expectedPassword),
  ]);
  return safeEqual(u1, u2) && safeEqual(p1, p2);
}
