"use client";

import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Schoolbell,
} from "next/font/google";
import { useEffect } from "react";

import {
  StatusHomeLink,
  StatusPage,
} from "@/components/status/status-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

type GlobalErrorPageProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

/**
 * Root-layout error boundary. Must render its own html/body.
 */
const GlobalErrorPage = ({ error, reset }: GlobalErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${schoolbell.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <StatusPage
          maskText="Error"
          title="Something went wrong"
          description="The app hit a critical error. Try again, or return home to continue."
          primaryAction={
            <button
              type="button"
              onClick={reset}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 w-full bg-white text-black hover:bg-white/90 sm:w-auto sm:min-w-36",
              )}
              aria-label="Try loading the app again"
            >
              Try again
            </button>
          }
          secondaryAction={<StatusHomeLink appearance="outline" />}
        />
      </body>
    </html>
  );
};

export default GlobalErrorPage;
