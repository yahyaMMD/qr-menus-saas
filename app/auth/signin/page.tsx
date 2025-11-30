import { redirect } from 'next/navigation';

export default function SigninRedirect() {
  // Keep compatibility with any links that point to /auth/signin
  redirect('/auth/login');
}
