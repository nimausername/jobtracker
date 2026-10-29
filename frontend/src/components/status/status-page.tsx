"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ShapeWavesBackground } from "@/components/reactbits/shape-waves-background";
import { SiteFooter } from "@/components/legal/site-footer";
import { SITE_INFO } from "@/lib/legal/site-info";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusPageProps = {
  /** Carved into the ShapeWaves field with the app main font. */
  readonly maskText: string;
  readonly title: string;
  readonly description: string;
  readonly primaryAction?: ReactNode;
  readonly secondaryAction?: ReactNode;
};

/**
 * Shared branded shell for 404 and runtime error screens.
 * ShapeWaves carves `maskText` with Plus Jakarta Sans; HTML content sits over the field.
 */
export const StatusPage = ({
  maskText,
  title,
  description,
  primaryAction,
  secondaryAction,
}: StatusPageProps) => {
  return (
    <ShapeWavesBackground
      className="h-dvh max-h-dvh overflow-hidden"
      contentClassName="h-full min-h-0"
      maskText={maskText}
    >
      <div className="flex h-full min-h-0 w-full flex-col pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="flex w-full max-w-lg flex-col items-center">
            <p className="sr-only">{maskText}</p>

            <p className="text-sm font-medium tracking-wide text-white/55">
              {SITE_INFO.productName}
            </p>

            <h1 className="font-heading mt-3 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold leading-tight tracking-tight text-balance text-white">
              {title}
            </h1>

            <p className="mt-3 max-w-md text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
              {description}
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              {primaryAction}
              {secondaryAction}
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </ShapeWavesBackground>
  );
};

type StatusHomeLinkProps = {
  readonly className?: string;
  readonly appearance?: "solid" | "outline";
};

/**
 * CTA shared by status screens — returns to the marketing home.
 */
export const StatusHomeLink = ({
  className,
  appearance = "solid",
}: StatusHomeLinkProps) => {
  return (
    <Link
      href="/"
      className={cn(
        buttonVariants({
          size: "lg",
          variant: appearance === "outline" ? "outline" : "default",
        }),
        "h-11 w-full sm:w-auto sm:min-w-36",
        appearance === "solid"
          ? "bg-white text-black hover:bg-white/90"
          : "border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white",
        className,
      )}
      aria-label={`Back to ${SITE_INFO.productName} home`}
    >
      Back home
    </Link>
  );
};
