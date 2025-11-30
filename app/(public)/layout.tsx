export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main>{children}</main>
      <footer className="text-center p-4 text-gray-500 border-t">© 2025 QResto</footer>
    </div>
  );
}
