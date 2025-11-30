import SignInForm from '@/components/auth/SignInForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="w-full max-w-md p-8 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">Sign In</h1>
        <SignInForm />
      </div>
    </div>
  );
}
