"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { LoaderCircleIcon } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { authControlClassName } from "@/components/auth/auth-field-styles";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/**
 * Sign-in form body; wrapped for `useSearchParams` Suspense requirements.
 */
const LoginFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const justRegistered = searchParams.get("registered") === "1";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
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
      description="Enter your email and password to access your account."
      footer={
        <>
          No account yet?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            href="/register"
          >
            Create one
          </Link>
        </>
      }
    >
      <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
        {justRegistered ? (
          <p
            className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
            role="status"
          >
            Account created successfully. Sign in with your new credentials.
          </p>
        ) : null}

        <FieldGroup>
          <Field data-invalid={Boolean(error) || undefined}>
            <FieldLabel htmlFor="login-email">Email address</FieldLabel>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              aria-required="true"
              disabled={isSubmitting}
              className={cn(authControlClassName)}
            />
          </Field>

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </FieldGroup>

        {error ? <FieldError>{error}</FieldError> : null}

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={isSubmitting}
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
