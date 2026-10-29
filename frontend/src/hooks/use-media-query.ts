"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. Server snapshot is always false.
 */
export const useMediaQuery = (query: string): boolean => {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
      };
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
};
