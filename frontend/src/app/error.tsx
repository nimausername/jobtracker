"use client";

import { useEffect } from "react";

import {
  StatusHomeLink,
  StatusPage,
} from "@/components/status/status-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorPageProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

/**
 * Route-level error UI with branded ShapeWaves background.
 */
const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      maskText="Error"
      title="Something went wrong"
      description="An unexpected error interrupted this page. You can try again, or return home."
      primaryAction={
        <button
          type="button"
          onClick={reset}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full bg-white text-black hover:bg-white/90 sm:w-auto sm:min-w-36",
          )}
          aria-label="Try loading this page again"
        >
          Try again
        </button>
      }
      secondaryAction={<StatusHomeLink appearance="outline" />}
    />
  );
};

export default ErrorPage;
