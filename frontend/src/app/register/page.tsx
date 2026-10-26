import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { SiteFooter } from "@/components/legal/site-footer";
import { GradientAsciiBackground } from "@/components/reactbits/gradient-ascii-background";

/**
 * Registration page shell — full-viewport auth card on GradientASCII.
 */
const RegisterPage = () => {
  return (
    <GradientAsciiBackground
      className="min-h-dvh"
      contentClassName="min-h-dvh px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <Link
            href="/"
            className="self-center text-sm font-medium text-white/70 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
            aria-label="Back to home"
          >
            Job Tracker
          </Link>
          <RegisterForm />
        </div>
        <SiteFooter compact className="pb-2" />
      </div>
    </GradientAsciiBackground>
  );
};

export default RegisterPage;
