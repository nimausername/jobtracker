import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";

/**
 * Registration page — marketing ASCII stage with product-density form.
 * Authenticated users are redirected to the dashboard.
 */
const RegisterPage = () => {
  return (
    <AuthPageShell>
      <RegisterForm />
    </AuthPageShell>
  );
};

export default RegisterPage;
