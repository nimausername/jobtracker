"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const ShapeWaves = dynamic(() => import("@/components/reactbits/ShapeWaves"), {
  ssr: false,
  loading: () => null,
});

/** Landing / auth brand surface used across public shells. */
export const BRAND_SURFACE = "#070b14";

/** ShapeWaves palette aligned with GradientASCII marketing colors. */
export const SHAPE_WAVES_BRAND = {
  backgroundColor: BRAND_SURFACE,
  color: "#1e3fd8",
  hoverColor: "#38bdf8",
} as const;

/**
 * Canvas needs the real family name — CSS vars are not resolved by 2D context.
 * Matches the app body / heading face (Plus Jakarta Sans).
 */
export const SHAPE_WAVES_MAIN_FONT =
  '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif';

type ShapeWavesBackgroundProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
  /** Large cutout text carved from the shape field (e.g. "404"). */
  readonly maskText?: string;
};

/**
 * Full-viewport ShapeWaves shell for status and error screens.
 * Uses Job Tracker brand blues; pointer splash interaction is disabled.
 */
export const ShapeWavesBackground = ({
  children,
  className,
  contentClassName,
  maskText = "",
}: ShapeWavesBackgroundProps) => {
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
          <ShapeWaves
            key={`${pathname}:${maskText}`}
            className="h-full min-h-dvh w-full"
            text={maskText}
            fontFamily={SHAPE_WAVES_MAIN_FONT}
            fontWeight={600}
            textSize={0.5}
            shapes="mixed"
            cellSize={12}
            dotSize={0.72}
            color={SHAPE_WAVES_BRAND.color}
            hoverColor={SHAPE_WAVES_BRAND.hoverColor}
            backgroundColor={SHAPE_WAVES_BRAND.backgroundColor}
            speed={0.55}
            scale={1.35}
            contrast={1.05}
            brightness={0.45}
            flow={12}
            direction={35}
            fade={0.28}
            interactive={false}
            splashRadius={0}
            splashStrength={0}
            glow={0.28}
            intro
          />
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-b from-black/30 via-transparent to-black/55"
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
