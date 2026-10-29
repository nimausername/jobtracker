import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

/**
 * In-app password reset page opened from the emailed token link.
 * Authenticated users are redirected to the dashboard.
 */
const ResetPasswordPage = () => {
  return (
    <AuthPageShell>
      <ResetPasswordForm />
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
