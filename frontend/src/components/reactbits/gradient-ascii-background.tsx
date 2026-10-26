"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const GradientASCII = dynamic(() => import("@/components/reactbits/GradientASCII"), {
  ssr: false,
  loading: () => null,
});

type GradientAsciiBackgroundProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
};

/**
 * Full-viewport GradientASCII shell used by marketing and auth screens.
 * Client-only mount avoids blank WebGL canvases on soft navigations.
 */
export const GradientAsciiBackground = ({
  children,
  className,
  contentClassName,
}: GradientAsciiBackgroundProps) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main
      className={cn(
        "relative flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-[#070b14]",
        className,
      )}
    >
      <div className="absolute inset-0 z-0 min-h-dvh" aria-hidden="true">
        {isMounted ? (
          <GradientASCII
            key={pathname}
            className="h-full min-h-dvh w-full"
            colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
            shape="horizon"
            fontFamily='"JetBrains Mono", ui-monospace, monospace'
            lightMode={false}
            mouseInteraction
            // Soft navigations can miss the intro clock; start fully revealed.
            intro={false}
            density={0.85}
            glyphOpacity={0.9}
            gradientOpacity={0.85}
            glow={0.25}
          />
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-b from-black/50 via-black/20 to-black/60"
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative z-10 flex w-full min-w-0 flex-1 flex-col",
          contentClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
};
