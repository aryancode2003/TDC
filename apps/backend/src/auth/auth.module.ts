import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from './guards/roles.guard';
import { User } from '../database/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';

/**
 * Auth Module
 * Handles authentication, JWT tokens, OTP, and OAuth integration
 * - Phone OTP authentication
 * - Email/Password authentication
 * - Google OAuth
 * - Apple OAuth (iOS)
 * - JWT token management
 * - Refresh token rotation
 * - Role-Based Access Control (RBAC)
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '15m') as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    UserRepository,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, PermissionsGuard, JwtModule, PassportModule],
})
export class AuthModule {}
