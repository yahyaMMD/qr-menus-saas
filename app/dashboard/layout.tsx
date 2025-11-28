export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block hover:text-blue-400">Home</a>
          <a href="/dashboard/profiles" className="block hover:text-blue-400">Profiles</a>
          <a href="/dashboard/settings" className="block hover:text-blue-400">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
