import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Public landing page for Job Tracker.
 */
const HomePage = () => {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-background to-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <p className="font-heading text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Job Tracker
        </p>
        <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Keep every application in one place
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Track status, notes, and follow-ups for jobs anywhere in the world —
          starting with a clean, open-source pipeline.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }))}
            aria-label="Sign in to Job Tracker"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            aria-label="Create a Job Tracker account"
          >
            Create account
          </Link>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          API health: configure{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          then run the backend on port 4000.
        </p>
      </div>
    </main>
  );
};

export default HomePage;
