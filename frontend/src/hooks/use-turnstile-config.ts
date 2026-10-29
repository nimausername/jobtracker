"use client";

import { useEffect, useState } from "react";

import { getAuthPublicConfig } from "@/lib/api/auth";

type TurnstileConfigState = {
  readonly siteKey: string | null;
  readonly enabled: boolean;
  readonly isLoading: boolean;
};

/**
 * Loads whether Turnstile is enabled and the public site key from the API.
 */
export const useTurnstileConfig = (): TurnstileConfigState => {
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const config = await getAuthPublicConfig();
        if (cancelled) {
          return;
        }
        setSiteKey(config.turnstileSiteKey);
        setEnabled(config.turnstileEnabled && Boolean(config.turnstileSiteKey));
      } catch {
        if (!cancelled) {
          setSiteKey(null);
          setEnabled(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { siteKey, enabled, isLoading };
};
