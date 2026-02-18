import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

// Inter font - optimized with next/font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: "GeoForce — Geoteknik Hesaplama Platformu",
  description: "Ücretsiz online geoteknik mühendislik hesaplama araçları. Taşıma kapasitesi, oturma, sıvılaşma, şev stabilitesi, kazık kapasitesi ve daha fazlası. TBDY 2018 uyumlu.",
  keywords: ["geoteknik", "hesaplama", "taşıma kapasitesi", "oturma", "sıvılaşma", "kazık", "TBDY 2018", "zemin mekaniği", "temel mühendisliği", "şev stabilitesi", "iksa", "geoteknik yazılım"],
  openGraph: {
    title: "GeoForce — Geoteknik Hesaplama Platformu",
    description: "Ücretsiz online geoteknik mühendislik hesaplama araçları. Taşıma kapasitesi, oturma, sıvılaşma, şev stabilitesi, kazık kapasitesi ve daha fazlası. TBDY 2018 uyumlu.",
    type: "website",
    locale: "tr_TR",
    siteName: "GeoForce",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoForce — Geoteknik Hesaplama Platformu",
    description: "Ücretsiz online geoteknik mühendislik hesaplama araçları. 26 modül, PDF rapor, TBDY 2018 uyumlu.",
  },
  robots: "index, follow",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased flex flex-col`}>
        {/* Skip Link for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
        >
          Ana içeriğe atla
        </a>
        <NextIntlClientProvider messages={messages}>
        <AuthProvider>
        <Navbar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
