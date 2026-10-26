"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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
 * Registration form adapted from ReUI c-card-12, wired to the Job Tracker API.
 */
export const RegisterForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(email.trim(), password, name.trim() || undefined);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      description="Start tracking applications with a free account."
      footer={
        <>
          Already have an account?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            href="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="register-name">Name</FieldLabel>
            <Input
              id="register-name"
              name="name"
              autoComplete="name"
              placeholder="Optional"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              className={cn(authControlClassName)}
            />
          </Field>

          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="register-email">Email address</FieldLabel>
            <Input
              id="register-email"
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
            id="register-password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            description="At least 8 characters."
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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthCard>
  );
};
