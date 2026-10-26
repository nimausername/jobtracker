"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, type ChangeEventHandler } from "react";

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
};

/**
 * Password input with visibility toggle from ReUI c-card-12 / input-group.
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
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsVisible((current) => !current);
  };

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className={cn(authControlClassName)}>
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
