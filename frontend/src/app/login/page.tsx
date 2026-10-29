import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";

/**
 * Login page — marketing ASCII stage with product-density form.
 * Authenticated users are redirected to the dashboard.
 */
const LoginPage = () => {
  return (
    <AuthPageShell>
      <LoginForm />
    </AuthPageShell>
  );
};

export default LoginPage;
