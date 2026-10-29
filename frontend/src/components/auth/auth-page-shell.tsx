import Link from "next/link";
import type { ReactNode } from "react";

import { RequireGuest } from "@/components/auth/require-guest";
import { SiteFooter } from "@/components/legal/site-footer";
import { GradientAsciiBackground } from "@/components/reactbits/gradient-ascii-background";
import { SITE_INFO } from "@/lib/legal/site-info";

type AuthPageShellProps = {
  readonly children: ReactNode;
};

/**
 * Shared guest auth stage: ASCII background, brand mark, centered form, footer.
 * Keeps login and register visually aligned with the marketing landing page.
 */
export const AuthPageShell = ({ children }: AuthPageShellProps) => {
  return (
    <RequireGuest>
      <GradientAsciiBackground
        className="h-dvh max-h-dvh overflow-hidden"
        contentClassName="h-full min-h-0"
      >
        <div className="flex h-full min-h-0 w-full flex-col pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-2 sm:px-6">
            <div className="flex w-full max-w-sm flex-col items-center gap-8">
              <Link
                href="/"
                className="font-heading shrink-0 text-xl font-semibold tracking-tight text-white transition-colors duration-200 hover:text-white/85 sm:text-2xl"
                aria-label={`Back to ${SITE_INFO.productName} home`}
              >
                {SITE_INFO.productName}
              </Link>
              {children}
            </div>
          </div>
          <SiteFooter />
        </div>
      </GradientAsciiBackground>
    </RequireGuest>
  );
};
