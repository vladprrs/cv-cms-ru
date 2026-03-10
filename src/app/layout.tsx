import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "CV CMS",
  description: "Headless CMS для управления карьерными данными",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/android-chrome-192x192.png", sizes: "192x192" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <footer className="py-4 text-center text-xs text-muted-foreground">
              <a href="/privacy" className="underline hover:text-foreground">Политика конфиденциальности</a>
              <span className="mx-2">&middot;</span>
              <a href="/terms" className="underline hover:text-foreground">Условия использования</a>
              <span className="mx-2">&middot;</span>
              <a href="https://github.com/vladpr-com/cv-cms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">GitHub</a>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
