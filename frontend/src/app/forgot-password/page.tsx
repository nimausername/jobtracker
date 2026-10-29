import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

/**
 * Forgot-password page — requests a Keycloak reset email.
 * Authenticated users are redirected to the dashboard.
 */
const ForgotPasswordPage = () => {
  return (
    <AuthPageShell>
      <ForgotPasswordForm />
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
