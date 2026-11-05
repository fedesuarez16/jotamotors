import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const ok = await isValidSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  const from = req.nextUrl.pathname + req.nextUrl.search;
  if (from !== "/") url.searchParams.set("from", from);
  return NextResponse.redirect(url);
}

export const config = {
  // Todo menos /login, assets de Next y archivos estáticos de /public.
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|svg|webp|ico)$).*)"],
};
