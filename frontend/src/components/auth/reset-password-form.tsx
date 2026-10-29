"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { resetPasswordRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

/**
 * Completes password reset with the emailed token.
 */
const ResetPasswordFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing a token. Request a new one.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPasswordRequest({ token, password });
      toast.success("Password updated. Please sign in.");
      router.replace("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to reset password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Choose a new password"
      description="Pick a strong password for your account."
      footer={
        <>
          Back to{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
            href="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      {!token ? (
        <p
          className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          This reset link is incomplete.{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
          >
            Request a new one
          </Link>
          .
        </p>
      ) : (
        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-4">
            <PasswordField
              id="reset-password"
              label="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              description="8+ characters, with a letter and a number."
              disabled={isSubmitting}
            />

            <PasswordField
              id="reset-password-confirm"
              name="confirmPassword"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              disabled={isSubmitting}
            />
          </FieldGroup>

          {error ? <FieldError>{error}</FieldError> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );
};

/**
 * Reset form wrapped for `useSearchParams` Suspense requirements.
 */
export const ResetPasswordForm = () => {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormContent />
    </Suspense>
  );
};
