import Link from "next/link";
import type { ReactNode } from "react";

import { LEGAL_NAV, SITE_INFO } from "@/lib/legal/site-info";
import { cn } from "@/lib/utils";

type LegalPageShellProps = {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
  readonly currentPath: string;
};

/**
 * Minimal readable layout for public legal documents.
 */
export const LegalPageShell = ({
  title,
  description,
  children,
  currentPath,
}: LegalPageShellProps) => {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link
              href="/"
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              ← {SITE_INFO.productName}
            </Link>
            <nav aria-label="Legal pages" className="flex flex-wrap gap-x-4 gap-y-1">
              {LEGAL_NAV.map((item) => {
                const isActive = item.href === currentPath;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "underline-offset-4 transition-colors hover:text-foreground hover:underline",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              Last updated: {SITE_INFO.lastUpdatedLabel}
            </p>
          </div>
        </header>

        <div className="mt-10 space-y-8">{children}</div>

        <footer className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            {SITE_INFO.productFullName} ·{" "}
            <a
              href={`mailto:${SITE_INFO.contactEmail}`}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {SITE_INFO.contactEmail}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

type LegalSectionProps = {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
};

/**
 * Anchored section used inside legal documents.
 */
export const LegalSection = ({ id, title, children }: LegalSectionProps) => {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-8">
      <h2
        id={`${id}-heading`}
        className="font-heading mb-3 text-base font-semibold tracking-tight"
      >
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
};
