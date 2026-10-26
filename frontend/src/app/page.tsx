import Link from "next/link";
import { CodeXmlIcon } from "lucide-react";

import { SiteFooter } from "@/components/legal/site-footer";
import { GradientAsciiBackground } from "@/components/reactbits/gradient-ascii-background";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Public landing page for Job Tracker.
 * Locked to one viewport — hero uses empty space; footer sits in the remainder.
 */
const HomePage = () => {
  return (
    <GradientAsciiBackground
      className="h-dvh max-h-dvh overflow-hidden"
      contentClassName="h-full min-h-0"
    >
      <div className="flex h-full min-h-0 w-full flex-col pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="flex w-full max-w-3xl flex-col items-center">
            <Badge
              variant="outline"
              className="h-7 gap-1.5 border-white/20 bg-white/10 px-3 text-white backdrop-blur-sm"
            >
              <CodeXmlIcon aria-hidden="true" />
              Open source & self-hosted
            </Badge>

            <h1 className="font-heading mt-5 max-w-[18ch] text-[clamp(2rem,6.5vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-balance text-white sm:mt-6 sm:max-w-[20ch]">
              Keep every{" "}
              <span className="font-display text-[1.15em] font-normal leading-none">
                application
              </span>{" "}
              in one place
            </h1>

            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-white/75 sm:mt-5 sm:max-w-xl sm:text-lg">
              Track status, notes, and follow-ups for jobs anywhere in the world
              — starting with a clean, open-source pipeline.
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full bg-white text-black hover:bg-white/90 sm:w-auto sm:min-w-36",
                )}
                aria-label="Sign in to Job Tracker"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 w-full border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-36",
                )}
                aria-label="Create a Job Tracker account"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </GradientAsciiBackground>
  );
};

export default HomePage;
