import { Role } from './types';

// Role hierarchy: USER < RESTAURANT_OWNER < ADMIN
const roleHierarchy: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.RESTAURANT_OWNER]: 2,
  [Role.ADMIN]: 3,
};

// Check if a user has a specific role or higher
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAdmin(userRole: Role): boolean {
  return userRole === Role.ADMIN;
}

export function isRestaurantOwner(userRole: Role): boolean {
  return userRole === Role.RESTAURANT_OWNER || userRole === Role.ADMIN;
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

export function requireRestaurantOwner(userRole: Role): void {
  if (!isRestaurantOwner(userRole)) {
    throw new Error('Access denied. Restaurant owner role required.');
  }
}
