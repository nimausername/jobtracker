import Link from "next/link";

import { LEGAL_NAV, SITE_INFO } from "@/lib/legal/site-info";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  readonly className?: string;
  readonly compact?: boolean;
};

/**
 * Public footer with legal navigation for marketing and auth surfaces.
 */
export const SiteFooter = ({ className, compact = false }: SiteFooterProps) => {
  return (
    <footer
      className={cn(
        "w-full border-t border-white/10",
        compact ? "pt-4" : "pt-6",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 text-center sm:px-6",
          compact ? "gap-2" : "gap-3",
        )}
      >
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          {LEGAL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs text-white/55 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={SITE_INFO.sourceUrl}
            className="text-xs text-white/55 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline sm:text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
          </Link>
        </nav>
        <p className="text-[11px] leading-relaxed text-white/40 sm:text-xs">
          © {new Date().getFullYear()} {SITE_INFO.operatorName}.{" "}
          {SITE_INFO.productFullName}. {SITE_INFO.licenseName}.
        </p>
      </div>
    </footer>
  );
};
