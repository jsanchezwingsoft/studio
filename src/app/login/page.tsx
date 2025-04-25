import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    // Use flex-grow to ensure this container fills the space provided by the layout
    // Use min-h-screen and flex to center the form vertically
    <div className="flex flex-grow flex-col items-center justify-center min-h-screen p-4">
      <LoginForm />
    </div>
  );
}
