import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export const metadata: Metadata = {
  title: "Jotamotors CRM",
  description: "Leads de WhatsApp — Jotamotors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-x-hidden">
            <Topbar />
            <div className="flex-1">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
