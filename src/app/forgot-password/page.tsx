import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4"> {/* Use themed background */}
      <ForgotPasswordForm />
    </main>
  );
}
