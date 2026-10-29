/**
 * Builds avatar initials from a display name or email.
 */
export const getInitials = (
  name?: string | null,
  email?: string | null,
): string => {
  if (name?.trim()) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return email?.slice(0, 2).toUpperCase() || "JT";
};
