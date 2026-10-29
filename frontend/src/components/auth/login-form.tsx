"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { LoaderCircleIcon, MailIcon } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordField } from "@/components/auth/password-field";
import {
  resetTurnstileWidgets,
  TurnstileWidget,
} from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { useTurnstileConfig } from "@/hooks/use-turnstile-config";
import { ApiError } from "@/lib/api/client";

/**
 * Sign-in form body; wrapped for `useSearchParams` Suspense requirements.
 */
const LoginFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const turnstile = useTurnstileConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const justRegistered = searchParams.get("registered") === "1";
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
      await login(email.trim(), password, {
        ...(turnstileToken ? { turnstileToken } : {}),
      });
      router.replace("/dashboard");
    } catch (err) {
      resetTurnstileWidgets();
      setTurnstileToken(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      description="Continue to your pipeline."
      footer={
        <>
          No account yet?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
            href="/register"
          >
            Create one
          </Link>
        </>
      }
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {justRegistered ? (
          <p
            className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
            role="status"
          >
            Account created. Sign in to continue.
          </p>
        ) : null}

        <FieldGroup className="gap-4">
          <AuthTextField
            id="login-email"
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

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting}
            labelAction={
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            }
          />

          {turnstile.enabled && turnstile.siteKey ? (
            <TurnstileWidget
              siteKey={turnstile.siteKey}
              action="login"
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
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthCard>
  );
};

/**
 * Sign-in form adapted from ReUI c-card-12, wired to the Job Tracker API.
 */
export const LoginForm = () => {
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
};
