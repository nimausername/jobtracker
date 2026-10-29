"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  LoaderCircleIcon,
  MailIcon,
  UserIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordField } from "@/components/auth/password-field";
import {
  resetTurnstileWidgets,
  TurnstileWidget,
} from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { useTurnstileConfig } from "@/hooks/use-turnstile-config";
import { ApiError } from "@/lib/api/client";
import { SITE_INFO } from "@/lib/legal/site-info";

/**
 * Registration form adapted from ReUI c-card-12, wired to the Job Tracker API.
 */
export const RegisterForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const turnstile = useTurnstileConfig();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const turnstileReady = !turnstile.enabled || Boolean(turnstileToken);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setError("Enter your first and last name.");
      return;
    }

    if (!acceptedLegal) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    if (turnstile.enabled && !turnstileToken) {
      setError("Complete the security check and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email.trim(), password, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        acceptedLegal: true,
        documentsVersion: SITE_INFO.documentsVersion,
        ...(turnstileToken ? { turnstileToken } : {}),
      });
      toast.success("Account created. Please sign in.");
      router.replace("/login?registered=1");
    } catch (err) {
      resetTurnstileWidgets();
      setTurnstileToken(null);
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
      description="Start tracking applications."
      footer={
        <>
          Already have an account?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
            href="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthTextField
              id="register-first-name"
              name="given-name"
              label="First name"
              icon={UserIcon}
              autoComplete="given-name"
              placeholder="Ada"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
              disabled={isSubmitting}
            />

            <AuthTextField
              id="register-last-name"
              name="family-name"
              label="Last name"
              icon={UserRoundIcon}
              autoComplete="family-name"
              placeholder="Lovelace"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <AuthTextField
            id="register-email"
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
            id="register-password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            description="8+ characters, with a letter and a number."
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
              className="min-w-0 flex-1 text-sm leading-snug font-normal text-muted-foreground"
            >
              I am {SITE_INFO.minAge}+ and agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {turnstile.enabled && turnstile.siteKey ? (
            <TurnstileWidget
              siteKey={turnstile.siteKey}
              action="register"
              onTokenChange={setTurnstileToken}
            />
          ) : null}
        </FieldGroup>

        {error ? <FieldError>{error}</FieldError> : null}

        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting ||
            !acceptedLegal ||
            turnstile.isLoading ||
            !turnstileReady
          }
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
