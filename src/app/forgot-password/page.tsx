import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    // Use flex-grow and min-h-screen to ensure vertical centering
    <div className="flex flex-grow flex-col items-center justify-center min-h-screen p-4">
      <ForgotPasswordForm />
    </div>
  );
}
