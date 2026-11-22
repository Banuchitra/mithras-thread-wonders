// Access rules — pure TypeScript, no framework (hexagonal core). See ADR-004 / ADR-005.

export const ROLES = ['admin', 'editor', 'customer'] as const;
export type Role = (typeof ROLES)[number];

/** Stored account, keyed by lower-case email. */
export interface UserRecord {
  email: string;
  displayName: string;
  role: Role;
  disabled: boolean;
  passwordHash: string | null;
  mustChangePassword: boolean;
  /** Bumped on password change/reset/disable — sessions carrying an older version are rejected. */
  tokenVersion: number;
  failedLogins: number;
  lockedUntil: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

/** What a user may see about themselves or (admins) others — never the password hash. */
export const publicUser = (u: UserRecord, superAdminEmail: string) => ({
  email: u.email,
  displayName: u.displayName,
  role: isSuperAdmin(u.email, superAdminEmail) ? 'admin' : u.role,
  disabled: u.disabled,
  mustChangePassword: u.mustChangePassword,
  isSuperAdmin: isSuperAdmin(u.email, superAdminEmail),
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt,
});

export interface Access {
  role: Role;
  isSuperAdmin: boolean;
}

export interface Actor extends Access {
  email: string;
}

export interface UserChange {
  role?: Role;
  disabled?: boolean;
  remove?: boolean;
}

export class AccessError extends Error {
  constructor(public status: 400 | 401 | 403 | 404 | 409 | 429, message: string) {
    super(message);
  }
}

export const normaliseEmail = (email: string) => email.trim().toLowerCase();
export const isValidEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

export function isSuperAdmin(email: string, superAdminEmail: string): boolean {
  return normaliseEmail(email) === normaliseEmail(superAdminEmail);
}

/** The super admin is always admin and can't be locked out by data; disabled users are blocked. */
export function effectiveAccess(user: UserRecord, superAdminEmail: string): Access {
  if (isSuperAdmin(user.email, superAdminEmail)) return { role: 'admin', isSuperAdmin: true };
  if (user.disabled) throw new AccessError(403, 'This account has been disabled');
  return { role: user.role, isSuperAdmin: false };
}

export function assertAdmin(actor: Access): void {
  if (actor.role !== 'admin') throw new AccessError(403, 'Admins only');
}

export function assertCanChange(actor: Actor, targetEmail: string, change: UserChange, superAdminEmail: string): void {
  assertAdmin(actor);
  if (isSuperAdmin(targetEmail, superAdminEmail)) throw new AccessError(403, 'The super admin cannot be changed');
  if (change.role !== undefined && !ROLES.includes(change.role)) throw new AccessError(400, 'Unknown role');
  const self = normaliseEmail(targetEmail) === normaliseEmail(actor.email);
  if (self && (change.disabled || change.remove)) throw new AccessError(400, 'You cannot disable or remove yourself');
}
