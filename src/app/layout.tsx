import type { Metadata } from "next";
import { Barlow_Semi_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jotamotors CRM",
  description: "Leads de WhatsApp — Jotamotors",
  icons: { icon: "/logo-jotamotors.jpeg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col overflow-x-clip">
            <Topbar />
            <div className="flex-1">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
