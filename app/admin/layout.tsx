// @ts-nocheck
"use client";

import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        <Footer />
    </ProtectedRoute>
  );
}
