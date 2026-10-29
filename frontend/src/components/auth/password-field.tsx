"use client";

import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useState, type ChangeEventHandler, type ReactNode } from "react";

import { authControlClassName } from "@/components/auth/auth-field-styles";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  readonly id: string;
  readonly name?: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly autoComplete: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly minLength?: number;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly labelAction?: ReactNode;
};

/**
 * Password field with lock prefix + visibility toggle (ReUI input-group pattern).
 */
export const PasswordField = ({
  id,
  name = "password",
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "Password",
  required = true,
  minLength,
  description,
  disabled = false,
  invalid = false,
  labelAction,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsVisible((current) => !current);
  };

  return (
    <Field data-invalid={invalid || undefined}>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {labelAction}
      </div>
      <InputGroup className={cn(authControlClassName)}>
        <InputGroupAddon align="inline-start">
          <LockIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          name={name}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          disabled={disabled}
          aria-required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={description ? `${id}-description` : undefined}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            type="button"
            aria-label={isVisible ? "Hide password" : "Show password"}
            onClick={handleToggleVisibility}
            disabled={disabled}
          >
            {isVisible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description ? (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      ) : null}
    </Field>
  );
};
