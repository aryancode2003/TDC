/**
 * JWT Strategy for Passport
 * Validates JWT tokens from Authorization header
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../users/repositories/user.repository';
import { JwtPayload } from '../dto/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tdc_default_jwt_secret_key_2026_operations_auth',
    });
  }

  /**
   * Validate JWT token and return payload
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Verify user still exists and is active
    const user = await this.userRepository.findByIdWithRoles(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Return enriched payload with user info
    return {
      sub: payload.sub,
      email: payload.email,
      phone: payload.phone,
      userType: payload.userType,
      tenantId: payload.tenantId,
      roles: user.role ? [user.role.type] : [],
      permissions: user.role?.permissions?.map((p) => p.name) || [],
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
