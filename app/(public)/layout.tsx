export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="p-4 shadow bg-white">
        <h1 className="font-bold text-xl">QResto</h1>
      </header>
      <main>{children}</main>
      <footer className="text-center p-4 text-gray-500 border-t">© 2025 QResto</footer>
    </div>
  );
}
