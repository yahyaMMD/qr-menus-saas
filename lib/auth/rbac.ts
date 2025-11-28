import { Role } from './types';

// Check if a user has a specific role
// returns true if user has the required role or higher
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    [Role.USER]: 1,
    [Role.ADMIN]: 2,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAdmin(userRole: Role): boolean {
  return userRole === Role.ADMIN;
}

export function requireRole(userRole: Role, requiredRole: Role): void {
  if (!hasRole(userRole, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
}

export function requireAdmin(userRole: Role): void {
  if (!isAdmin(userRole)) {
    throw new Error('Access denied. Admin role required.');
  }
}

