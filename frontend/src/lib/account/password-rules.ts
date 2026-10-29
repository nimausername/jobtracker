export type PasswordRuleId = "length" | "letter" | "digit" | "different";

export type PasswordRule = {
  readonly id: PasswordRuleId;
  readonly label: string;
  readonly met: boolean;
};

/**
 * Evaluates password requirements shared with the API register schema.
 */
export const evaluatePasswordRules = (input: {
  readonly password: string;
  readonly currentPassword?: string;
}): readonly PasswordRule[] => {
  const password = input.password;
  const rules: PasswordRule[] = [
    {
      id: "length",
      label: "At least 8 characters",
      met: password.length >= 8 && password.length <= 128,
    },
    {
      id: "letter",
      label: "Includes a letter",
      met: /[A-Za-z]/.test(password),
    },
    {
      id: "digit",
      label: "Includes a number",
      met: /[0-9]/.test(password),
    },
  ];

  if (typeof input.currentPassword === "string") {
    rules.push({
      id: "different",
      label: "Different from current password",
      met:
        password.length > 0 &&
        input.currentPassword.length > 0 &&
        password !== input.currentPassword,
    });
  }

  return rules;
};

/**
 * Whether every evaluated password rule is satisfied.
 */
export const passwordRulesSatisfied = (
  rules: readonly PasswordRule[],
): boolean => rules.every((rule) => rule.met);
