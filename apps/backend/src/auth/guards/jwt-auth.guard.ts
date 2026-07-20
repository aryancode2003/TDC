/**
 * JWT Auth Guard
 * Protects routes and ensures valid JWT token is provided
 */

import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
