"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { PasswordField } from "@/components/auth/password-field";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import {
  evaluatePasswordRules,
  passwordRulesSatisfied,
} from "@/lib/account/password-rules";
import { changePasswordRequest } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/**
 * Security section — in-app password change with live requirements.
 */
export const AccountPasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentInvalid, setCurrentInvalid] = useState(false);

  const rules = useMemo(
    () =>
      evaluatePasswordRules({
        password: newPassword,
        currentPassword,
      }),
    [newPassword, currentPassword],
  );

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const confirmTouched = confirmPassword.length > 0;
  const confirmMismatch = confirmTouched && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    passwordRulesSatisfied(rules) &&
    passwordsMatch &&
    !isSaving;

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFormError(null);
    setCurrentInvalid(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setCurrentInvalid(false);

    try {
      await changePasswordRequest({
        currentPassword,
        newPassword,
      });
      handleReset();
      toast.success("Password updated");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not update your password";
      const isCurrentWrong =
        err instanceof ApiError &&
        (err.details.some((detail) => detail.field === "currentPassword") ||
          /current password/i.test(err.message));

      if (isCurrentWrong) {
        setCurrentInvalid(true);
      }
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Frame spacing="default" className="min-w-0">
      <FrameHeader>
        <FrameTitle>Password</FrameTitle>
        <FrameDescription>
          Change it here and stay signed in.
        </FrameDescription>
      </FrameHeader>

      <form
        className="contents"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        noValidate
      >
        <FramePanel>
          <FieldGroup className="gap-4">
            <PasswordField
              id="account-current-password"
              name="current-password"
              label="Current password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setCurrentInvalid(false);
                setFormError(null);
              }}
              disabled={isSaving}
              invalid={currentInvalid}
              required
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <PasswordField
                id="account-new-password"
                name="new-password"
                label="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setFormError(null);
                }}
                disabled={isSaving}
                required
                minLength={8}
              />

              <PasswordField
                id="account-confirm-password"
                name="confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setFormError(null);
                }}
                disabled={isSaving}
                invalid={confirmMismatch}
                required
              />
            </div>

            <ul
              className="grid gap-1.5 sm:grid-cols-2"
              aria-label="Password requirements"
            >
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-colors",
                    rule.met
                      ? "text-success-foreground dark:text-success"
                      : "text-muted-foreground",
                  )}
                >
                  {rule.met ? (
                    <CheckIcon
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleIcon
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>{rule.label}</span>
                </li>
              ))}
              <li
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  passwordsMatch
                    ? "text-success-foreground dark:text-success"
                    : "text-muted-foreground",
                )}
              >
                {passwordsMatch ? (
                  <CheckIcon className="size-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <CircleIcon
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>Passwords match</span>
              </li>
            </ul>

            {confirmMismatch ? (
              <FieldError>Passwords do not match</FieldError>
            ) : null}
            {formError ? <FieldError>{formError}</FieldError> : null}
          </FieldGroup>
        </FramePanel>

        <FrameFooter>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={
                isSaving ||
                (!currentPassword && !newPassword && !confirmPassword)
              }
            >
              Clear
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <>
                  <LoaderCircleIcon
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </div>
        </FrameFooter>
      </form>
    </Frame>
  );
};
