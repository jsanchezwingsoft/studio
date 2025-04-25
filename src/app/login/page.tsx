import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    // Use flex-grow to ensure this container fills the space provided by the layout
    <main className="flex flex-grow flex-col items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
