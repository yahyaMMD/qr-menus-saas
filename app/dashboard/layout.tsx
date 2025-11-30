'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout as DashboardLayoutComponent } from '@/components/dashboard/DashboardLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayoutComponent>
        {children}
      </DashboardLayoutComponent>
    </ProtectedRoute>
  );
}
