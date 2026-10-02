import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./I18nProvider";
import { getServerDictionary } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerDictionary();
  return {
    title: "EmailGo",
    description:
      locale === "fr"
        ? "Envoi d'emails automatique avec templates via Gmail"
        : "Automated templated email sending via Gmail",
  };
}

const THEME_INIT_SCRIPT = `
try {
  var stored = localStorage.getItem('theme');
  var isDark;
  if (stored === 'light') isDark = false;
  else if (stored === 'system') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  else isDark = true;
  if (isDark) document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getServerDictionary();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="h-dvh overflow-hidden bg-background text-foreground">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
