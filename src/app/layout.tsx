import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pokédex Thailand | สารานุกรม Pokémon ครบถ้วนที่สุดในไทย",
    template: "%s | Pokédex Thailand",
  },
  description:
    "สารานุกรม Pokémon ที่ครบถ้วนที่สุดในประเทศไทย รองรับทุก Generation ทุก Form พร้อม Team Builder, Battle Simulator, Competitive Analysis และ AI Team Builder",
  keywords: [
    "Pokédex", "Pokemon", "โปเกมอน", "โปเกเด็กซ์ไทย", "Team Builder",
    "Battle Simulator", "Competitive", "Pokémon Thailand", "สารานุกรมโปเกมอน",
  ],
  authors: [{ name: "Pokédex Thailand" }],
  creator: "Pokédex Thailand",
  openGraph: {
    type: "website",
    locale: "th_TH",
    alternateLocale: "en_US",
    title: "Pokédex Thailand - สารานุกรม Pokémon ที่ครบถ้วนที่สุด",
    description: "สารานุกรม Pokémon ที่ครบถ้วนที่สุดในประเทศไทย",
    siteName: "Pokédex Thailand",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokédex Thailand",
    description: "สารานุกรม Pokémon ที่ครบถ้วนที่สุดในประเทศไทย",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#CC0000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(222 47% 9%)",
                  color: "hsl(210 40% 98%)",
                  border: "1px solid hsl(217 33% 17%)",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
