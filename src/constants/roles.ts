// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  STAFF: 'staff',
  SUPER_ADMIN: 'super_admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Role permissions helper
export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};
