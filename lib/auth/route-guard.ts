import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from './middleware';
import { requireRole, requireAdmin, hasRole } from './rbac';
import { Role } from './types';

// This is for providing routes guides for the backend API routes
//   - Authentication
//   - Role-based access control
//   - Admin access

export interface RouteGuardOptions {
  requiredRole?: Role;
  requireAdmin?: boolean;
}

export function withAuth<T = any>(
  handler: (request: NextRequest, user: { userId: string; email: string; role: Role }) => Promise<NextResponse<T>>,
  options: RouteGuardOptions = {}
): (request: NextRequest) => Promise<NextResponse<T | { error: string }>> {
  return async (request: NextRequest) => {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success || !authResult.payload) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { payload } = authResult;

    // Check role requirements
    if (options.requireAdmin) {
      try {
        requireAdmin(payload.role);
      } catch (error) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    } else if (options.requiredRole) {
      try {
        requireRole(payload.role, options.requiredRole);
      } catch (error) {
        return NextResponse.json(
          { error: `Access denied. Required role: ${options.requiredRole}` },
          { status: 403 }
        );
      }
    }

    // Call the handler with authenticated user
    return handler(request, {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  };
}

export function withAdmin<T = any>(
  handler: (request: NextRequest, user: { userId: string; email: string; role: Role }) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T | { error: string }>> {
  return withAuth(handler, { requireAdmin: true });
}

export function withRole<T = any>(
  handler: (request: NextRequest, user: { userId: string; email: string; role: Role }) => Promise<NextResponse<T>>,
  requiredRole: Role
): (request: NextRequest) => Promise<NextResponse<T | { error: string }>> {
  return withAuth(handler, { requiredRole });
}