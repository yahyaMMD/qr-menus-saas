export function AppLoader({ message, subtext }: { message?: string; subtext?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(255,239,217,0.7),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,237,213,0.7),transparent_35%)]" />
      <div className="relative flex flex-col items-center gap-6 px-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-100 shadow-[0_20px_60px_rgba(248,113,113,0.15)] flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 animate-[pulse_1.6s_ease-in-out_infinite] flex items-center justify-center text-white font-black text-lg">
            QR
          </div>
        </div>
        <div className="relative w-56 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
            style={{ animation: "qrloading 1.8s linear infinite" }}
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold">{message || "Loading your QResto experience"}</p>
          <p className="text-sm text-slate-500">
            {subtext || "Hang tight—fetching dashboards, menus, and analytics."}
          </p>
        </div>
      </div>
      <style>{`
        @keyframes qrloading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
