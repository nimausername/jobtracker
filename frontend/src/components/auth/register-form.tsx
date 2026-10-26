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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { SITE_INFO } from "@/lib/legal/site-info";
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
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!acceptedLegal) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email.trim(), password, {
        acceptedLegal: true,
        documentsVersion: SITE_INFO.documentsVersion,
        ...(name.trim() ? { name: name.trim() } : {}),
      });
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
            description="At least 8 characters, including a letter and a number."
            disabled={isSubmitting}
          />

          <div className="flex items-start gap-3">
            <Checkbox
              id="register-legal"
              checked={acceptedLegal}
              onCheckedChange={(checked) => setAcceptedLegal(checked)}
              required
              aria-required="true"
              disabled={isSubmitting}
              className="mt-0.5"
              aria-label={`Confirm I am at least ${SITE_INFO.minAge} and accept Terms of Service and Privacy Policy`}
            />
            <label
              htmlFor="register-legal"
              className="min-w-0 flex-1 text-sm leading-relaxed font-normal text-muted-foreground"
            >
              I confirm I am at least {SITE_INFO.minAge} years old and agree to
              the{" "}
              <Link
                href="/terms"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>
        </FieldGroup>

        {error ? <FieldError>{error}</FieldError> : null}

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={isSubmitting || !acceptedLegal}
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
