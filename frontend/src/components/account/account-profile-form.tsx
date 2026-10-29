"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/reui/badge";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/account/initials";
import { updateProfileRequest } from "@/lib/api/account";
import { refreshRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";

type AccountProfileFormProps = {
  readonly user: AuthUser;
};

/**
 * Profile section — identity + name fields in one stacked Frame.
 */
export const AccountProfileForm = ({ user }: AccountProfileFormProps) => {
  const { applyUser, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
  }, [user.firstName, user.lastName]);

  useEffect(() => {
    if (!justSaved) {
      return;
    }
    const timer = window.setTimeout(() => {
      setJustSaved(false);
    }, 2200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [justSaved]);

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const baselineFirst = (user.firstName ?? "").trim();
  const baselineLast = (user.lastName ?? "").trim();
  const isDirty =
    trimmedFirst !== baselineFirst || trimmedLast !== baselineLast;
  const isValid = trimmedFirst.length > 0 && trimmedLast.length > 0;
  const canSave = isDirty && isValid && !isSaving;

  const previewName =
    [trimmedFirst, trimmedLast].filter(Boolean).join(" ") ||
    user.name?.trim() ||
    "Account";
  const initials = getInitials(previewName, user.email);

  const handleReset = () => {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setFieldError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) {
      if (!isValid) {
        setFieldError("First and last name are required");
      }
      return;
    }

    setIsSaving(true);
    setFieldError(null);
    try {
      const profile = await updateProfileRequest({
        firstName: trimmedFirst,
        lastName: trimmedLast,
      });
      applyUser(profile);
      try {
        await refreshRequest();
        await refreshUser();
      } catch {
        // Local profile already updated; token claim sync can wait.
      }
      setJustSaved(true);
      toast.success("Profile updated");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not update your profile";
      setFieldError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Frame spacing="default" className="min-w-0">
      <FrameHeader>
        <div className="flex flex-wrap items-center gap-2">
          <FrameTitle>Profile</FrameTitle>
          {justSaved ? (
            <Badge
              variant="success-light"
              className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200 motion-reduce:animate-none"
            >
              <CheckIcon data-icon="inline-start" aria-hidden="true" />
              Saved
            </Badge>
          ) : null}
        </div>
        <FrameDescription>
          Your identity across Job Tracker.
        </FrameDescription>
      </FrameHeader>

      <form
        className="contents"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        noValidate
      >
        <FramePanel className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Avatar className="size-14">
              <AvatarFallback className="text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold tracking-tight">
                  {previewName}
                </p>
                <Badge variant="success-light">Active</Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {user.email ?? "Email unavailable"}
              </p>
            </div>
          </div>

          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                data-invalid={
                  (Boolean(fieldError) && !trimmedFirst) || undefined
                }
              >
                <FieldLabel htmlFor="account-first-name">First name</FieldLabel>
                <Input
                  id="account-first-name"
                  name="given-name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setFieldError(null);
                  }}
                  placeholder="Ada"
                  maxLength={60}
                  required
                  disabled={isSaving}
                  aria-required="true"
                />
              </Field>

              <Field
                data-invalid={
                  (Boolean(fieldError) && !trimmedLast) || undefined
                }
              >
                <FieldLabel htmlFor="account-last-name">Last name</FieldLabel>
                <Input
                  id="account-last-name"
                  name="family-name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    setFieldError(null);
                  }}
                  placeholder="Lovelace"
                  maxLength={60}
                  required
                  disabled={isSaving}
                  aria-required="true"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <Input
                id="account-email"
                type="email"
                value={user.email ?? ""}
                readOnly
                disabled
                aria-readonly="true"
              />
              <FieldDescription>
                Sign-in email cannot be changed here.
              </FieldDescription>
            </Field>

            {fieldError ? <FieldError>{fieldError}</FieldError> : null}
          </FieldGroup>
        </FramePanel>

        <FrameFooter>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!canSave}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <>
                  <LoaderCircleIcon
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </FrameFooter>
      </form>
    </Frame>
  );
};
