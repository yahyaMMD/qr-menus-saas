export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-md p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">Sign In</h1>
        <form className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
          <input type="password" placeholder="Password" className="w-full p-2 border rounded" />
          <button className="w-full py-2 bg-blue-600 text-white rounded">Login</button>
        </form>
      </div>
    </div>
  );
}
