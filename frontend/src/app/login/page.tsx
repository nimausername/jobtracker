import { LoginForm } from "@/components/auth/login-form";

/**
 * Login page shell.
 */
const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-background to-emerald-50 px-6 py-16">
      <LoginForm />
    </main>
  );
};

export default LoginPage;
