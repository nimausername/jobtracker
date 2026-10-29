import Link from "next/link";

import { LEGAL_NAV, SITE_INFO } from "@/lib/legal/site-info";
import { cn } from "@/lib/utils";

const GitHubMark = ({ className }: { readonly className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const linkClassName =
  "inline-flex items-center gap-1.5 text-sm text-white/55 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline";

type SiteFooterProps = {
  readonly className?: string;
};

/**
 * Public footer with legal navigation for marketing and auth surfaces.
 */
export const SiteFooter = ({ className }: SiteFooterProps) => {
  return (
    <footer className={cn("w-full shrink-0", className)}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-4 text-center sm:gap-3.5 sm:px-6 sm:py-5">
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {LEGAL_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={linkClassName}>
              {item.label}
            </Link>
          ))}
          <Link
            href={SITE_INFO.sourceUrl}
            className={linkClassName}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
          >
            <GitHubMark className="size-3.5 shrink-0" />
            Source
          </Link>
        </nav>
        <p className="max-w-md text-xs leading-relaxed text-white/40">
          © {new Date().getFullYear()} {SITE_INFO.operatorName}.{" "}
          {SITE_INFO.productName}. {SITE_INFO.licenseName}.
        </p>
      </div>
    </footer>
  );
};
