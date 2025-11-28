"use client";

import { FormEvent, useState } from "react";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

const ADMIN_DEFAULTS = {
  email: "admin@qrmenus.test",
  password: "admin123",
};

export default function TestAdminLoginPage() {
  const [email, setEmail] = useState(ADMIN_DEFAULTS.email);
  const [password, setPassword] = useState(ADMIN_DEFAULTS.password);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Failed to sign in.");
        return;
      }

      setTokens(data.tokens);
      // Persist tokens for other admin pages
      localStorage.setItem("authTokens", JSON.stringify(data.tokens));
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: data.user?.id,
          email: data.user?.email,
          role: data.user?.role,
          name: data.user?.name,
        })
      );
      setStatus("Signed in successfully as admin.");
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!tokens) {
      setTokens(null);
      setStatus(null);
      localStorage.removeItem("authTokens");
      localStorage.removeItem("authUser");
      return;
    }

    setIsLoggingOut(true);
    setError(null);

    try {
      const response = await fetch("/api/auth?action=logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error ?? "Logout failed, but session cleared locally.");
      }
    } catch (err) {
      setError("Unable to reach the server. Session cleared locally.");
    } finally {
      setTokens(null);
      setStatus("Logged out successfully.");
      setIsLoggingOut(false);
      localStorage.removeItem("authTokens");
      localStorage.removeItem("authUser");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Test Login</h1>
          <p className="text-sm text-gray-600">
            Use the admin credentials from <code>prisma/seed.ts</code>.
          </p>
        </div>

        {tokens ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-green-800">
              {status ?? "Signed in successfully."}
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="admin@qrmenus.test"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="admin123"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in as Admin"}
            </button>

            {status && !tokens && (
              <p className="text-center text-sm text-gray-600">{status}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
