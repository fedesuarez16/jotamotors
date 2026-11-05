import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Ingresar — Jotamotors CRM" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/logo-jotamotors.jpeg"
            alt="Jotamotors"
            width={64}
            height={64}
            className="rounded-lg"
          />
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-900">
            Jotamotors CRM
          </h1>
        </div>
        <LoginForm from={from ?? ""} />
      </div>
    </div>
  );
}
