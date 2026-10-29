import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Schoolbell,
} from "next/font/google";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_INFO } from "@/lib/legal/site-info";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const schoolbell = Schoolbell({
  variable: "--font-schoolbell",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.productionUrl),
  title: {
    default: SITE_INFO.productName,
    template: `%s · ${SITE_INFO.productName}`,
  },
  description:
    "Track job applications in one place — open source and self-hosted.",
  applicationName: SITE_INFO.productName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_INFO.productionUrl,
    siteName: SITE_INFO.productName,
    title: SITE_INFO.productName,
    description:
      "Keep every application in one place. Track status, notes, and follow-ups — open source and self-hosted.",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_INFO.productName,
    description:
      "Keep every application in one place. Track status, notes, and follow-ups — open source and self-hosted.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${schoolbell.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
