import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login page by default
  redirect('/login');

  // Keep the return statement to satisfy React component requirements,
  // although redirect will prevent it from rendering.
  return null;
}
