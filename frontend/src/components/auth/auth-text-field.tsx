"use client";

import type { LucideIcon } from "lucide-react";
import type { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

import { authControlClassName } from "@/components/auth/auth-field-styles";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type AuthTextFieldProps = {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly value: string;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly type?: HTMLInputTypeAttribute;
  readonly autoComplete?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
};

/**
 * Auth text field using ReUI InputGroup prefix-icon pattern (c-input-group-4).
 */
export const AuthTextField = ({
  id,
  name,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  required = false,
  disabled = false,
  invalid = false,
}: AuthTextFieldProps) => {
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className={cn(authControlClassName)}>
        {Icon ? (
          <InputGroupAddon align="inline-start">
            <Icon aria-hidden="true" />
          </InputGroupAddon>
        ) : null}
        <InputGroupInput
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          aria-required={required || undefined}
          disabled={disabled}
        />
      </InputGroup>
    </Field>
  );
};
