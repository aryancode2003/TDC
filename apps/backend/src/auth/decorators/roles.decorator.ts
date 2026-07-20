/**
 * Roles Decorator
 * Used to specify which roles can access an endpoint
 * Usage: @Roles('admin', 'super_admin')
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Permissions Decorator
 * Used to specify which permissions are required to access an endpoint
 * Usage: @Permissions('users:read', 'users:write')
 */
export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Public Decorator
 * Used to mark routes that don't require authentication
 * Usage: @Public()
 */
export const PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(PUBLIC_KEY, true);

/**
 * RateLimit Decorator
 * Used to specify rate limit for an endpoint
 * Usage: @RateLimit(10, 60) // 10 requests per 60 seconds
 */
export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export const RateLimit = (limit: number, windowMs: number) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowMs });
