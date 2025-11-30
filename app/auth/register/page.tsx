import SignUpForm from '@/components/auth/SignUpForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="w-full max-w-md p-8 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">Create an account</h1>
        <SignUpForm />
      </div>
    </div>
  );
}
