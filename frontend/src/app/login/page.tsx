import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { GradientAsciiBackground } from "@/components/reactbits/gradient-ascii-background";

/**
 * Login page shell — full-viewport auth card on GradientASCII.
 */
const LoginPage = () => {
  return (
    <GradientAsciiBackground
      className="min-h-dvh"
      contentClassName="min-h-dvh items-center justify-center px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      <div className="flex w-full min-w-0 max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="self-center text-sm font-medium text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          aria-label="Back to home"
        >
          Job Tracker
        </Link>
        <LoginForm />
      </div>
    </GradientAsciiBackground>
  );
};

export default LoginPage;
