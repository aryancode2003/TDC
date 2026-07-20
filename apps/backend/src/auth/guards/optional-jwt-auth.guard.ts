/**
 * Optional Auth Guard
 * Allows both authenticated and unauthenticated requests
 * Useful for endpoints where authentication is optional
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any) {
    // Allow request to proceed even if authentication fails
    // User will be undefined if not authenticated
    return user || null;
  }
}
