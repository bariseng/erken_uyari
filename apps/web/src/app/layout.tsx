import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased flex flex-col">
        <NextIntlClientProvider messages={messages}>
        <AuthProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
