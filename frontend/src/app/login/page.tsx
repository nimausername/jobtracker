import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/legal/site-footer";
import { GradientAsciiBackground } from "@/components/reactbits/gradient-ascii-background";

/**
 * Login page shell — locked to one viewport; form centered, footer full-width.
 */
const LoginPage = () => {
  return (
    <GradientAsciiBackground
      className="h-dvh max-h-dvh overflow-hidden"
      contentClassName="h-full min-h-0"
    >
      <div className="flex h-full min-h-0 w-full flex-col pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-2 sm:px-6">
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            <Link
              href="/"
              className="shrink-0 text-sm font-medium text-white/70 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
              aria-label="Back to home"
            >
              Job Tracker
            </Link>
            <LoginForm />
          </div>
        </div>
        <SiteFooter />
      </div>
    </GradientAsciiBackground>
  );
};

export default LoginPage;
