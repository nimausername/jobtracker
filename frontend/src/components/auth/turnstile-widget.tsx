"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type TurnstileApi = {
  readonly render: (
    container: HTMLElement,
    options: {
      readonly sitekey: string;
      readonly theme?: "auto" | "light" | "dark";
      readonly action?: string;
      readonly callback?: (token: string) => void;
      readonly "expired-callback"?: () => void;
      readonly "error-callback"?: () => void;
    },
  ) => string;
  readonly reset: (widgetId?: string) => void;
  readonly remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  readonly siteKey: string;
  readonly action: string;
  readonly onTokenChange: (token: string | null) => void;
  readonly className?: string;
};

/**
 * Cloudflare Turnstile widget (explicit render) for auth forms.
 */
export const TurnstileWidget = ({
  siteKey,
  action,
  onTokenChange,
  className,
}: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current !== null) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      action,
      callback: (token) => {
        onTokenChangeRef.current(token);
      },
      "expired-callback": () => {
        onTokenChangeRef.current(null);
      },
      "error-callback": () => {
        onTokenChangeRef.current(null);
      },
    });

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, scriptReady, siteKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => {
          setScriptReady(true);
        }}
      />
      <div
        ref={containerRef}
        className={cn("flex min-h-[65px] justify-center", className)}
        aria-label="Security check"
      />
    </>
  );
};

/**
 * Resets the Turnstile widget currently mounted in the page (best-effort).
 */
export const resetTurnstileWidgets = (): void => {
  window.turnstile?.reset();
};
