import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    // Use flex-grow to ensure this container fills the space provided by the layout
    <main className="flex flex-grow flex-col items-center justify-center p-4 animate-fade-in">
      <ForgotPasswordForm />
    </main>
  );
}
