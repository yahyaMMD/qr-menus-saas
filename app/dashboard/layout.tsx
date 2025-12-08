'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout as DashboardLayoutComponent } from '@/components/dashboard/DashboardLayout';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Navbar/>
      <DashboardLayoutComponent>
        {children}
      </DashboardLayoutComponent>
      <Footer/>
    </ProtectedRoute>
  );
}
