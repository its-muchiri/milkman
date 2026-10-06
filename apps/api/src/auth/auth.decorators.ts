import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { AdminPermission, UserRole } from '@milkman/shared';

/** Mark a route as callable without a JWT. */
export const IS_PUBLIC_KEY = 'milkman:isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Restrict a route to the given roles. */
export const ROLES_KEY = 'milkman:roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/** Require admin sub-permissions (depot / finance) in addition to the admin role. */
export const PERMISSIONS_KEY = 'milkman:permissions';
export const RequirePermission = (...perms: AdminPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, perms);

/** The authenticated principal attached to the request by JwtAuthGuard. */
export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string | null;
  phone: string | null;
  adminPerms: AdminPermission[];
}

/** Parameter decorator: inject the logged-in admin/rider. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return req.user;
  },
);
