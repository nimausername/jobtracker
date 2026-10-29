"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LoaderCircleIcon, MailIcon } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthTextField } from "@/components/auth/auth-text-field";
import {
  resetTurnstileWidgets,
  TurnstileWidget,
} from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { useTurnstileConfig } from "@/hooks/use-turnstile-config";
import { forgotPasswordRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

/**
 * Requests an in-app password-reset email for the given address.
 */
export const ForgotPasswordForm = () => {
  const turnstile = useTurnstileConfig();
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const turnstileReady = !turnstile.enabled || Boolean(turnstileToken);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (turnstile.enabled && !turnstileToken) {
      setError("Complete the security check and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPasswordRequest({
        email: email.trim(),
        ...(turnstileToken ? { turnstileToken } : {}),
      });
      setIsSent(true);
    } catch (err) {
      resetTurnstileWidgets();
      setTurnstileToken(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to send reset email. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Reset password"
      description={
        isSent
          ? "Check your inbox for the next step."
          : "We’ll email a link to reset it here."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
            href="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      {isSent ? (
        <p
          className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          If an account exists for that email, a reset link is on its way. The
          link expires in 12 hours.
        </p>
      ) : (
        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-4">
            <AuthTextField
              id="forgot-password-email"
              name="email"
              label="Email"
              icon={MailIcon}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isSubmitting}
              invalid={Boolean(error)}
            />

            {turnstile.enabled && turnstile.siteKey ? (
              <TurnstileWidget
                siteKey={turnstile.siteKey}
                action="forgot-password"
                onTokenChange={setTurnstileToken}
              />
            ) : null}
          </FieldGroup>

          {error ? <FieldError>{error}</FieldError> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || turnstile.isLoading || !turnstileReady}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );
};
