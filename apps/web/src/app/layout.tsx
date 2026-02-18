import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "GeoForce — Geoteknik Hesap Platformu",
  description: "Açık kaynak, web tabanlı geoteknik mühendisliği hesap araçları. TBDY 2018 uyumlu.",
  keywords: ["geoteknik", "taşıma kapasitesi", "sıvılaşma", "TBDY 2018", "zemin mekaniği"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
        <AuthProvider>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-[var(--card-border)] mt-16">
          <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-[var(--muted)]">
            <p>GeoForce — Açık Kaynak Geoteknik Hesap Platformu</p>
            <p className="mt-1">© 2026 GeoForce. MIT Lisansı ile yayınlanmıştır.</p>
          </div>
        </footer>
        </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
