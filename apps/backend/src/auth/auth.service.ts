/**
 * Auth Service
 * Core authentication business logic
 * Handles login, registration, token generation, OTP
 */

import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../users/repositories/user.repository';
import { RegisterDto, LoginDto, OtpRequestDto, OtpVerifyDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload, JwtResponse } from './dto/jwt.interface';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';

@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();
  private readonly jwtRefreshTokenStore = new Map<string, { expiresAt: number }>();

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, phone, password, firstName, lastName, userType } = registerDto;

    // Validate input
    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    // Check if user already exists
    if (email) {
      const existingEmail = await this.userRepository.emailExists(email);
      if (existingEmail) {
        throw new ConflictException('Email already registered');
      }
    }

    if (phone) {
      const existingPhone = await this.userRepository.phoneExists(phone);
      if (existingPhone) {
        throw new ConflictException('Phone already registered');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find role
    const role = await this.userRepository.manager.findOne(Role, {
      where: { type: userType },
    });
    if (!role) {
      throw new BadRequestException(`Role for user type ${userType} not found`);
    }

    // Create user
    const user = this.userRepository.create({
      email,
      phone,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      userType,
      roleId: role.id,
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: this.mapUserToResponse(savedUser),
    };
  }

  /**
   * Login with email/phone and password
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, phone, password } = loginDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    // Find user
    let user: User | null;
    if (email) {
      user = await this.userRepository.findByEmail(email);
    } else {
      user = await this.userRepository.findByPhone(phone!);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    console.log('COMPARING PASSWORDS:', {
      password,
      userPasswordHash: user.passwordHash,
    });
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: this.mapUserToResponse(user),
    };
  }

  /**
   * Request OTP for phone verification
   */
  async requestOtp(otpRequestDto: OtpRequestDto): Promise<{ expiresIn: number }> {
    const { phone } = otpRequestDto;

    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in memory (in production, use Redis)
    this.otpStore.set(phone, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // TODO: Send OTP via SMS (Twilio)
    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    return {
      expiresIn: 300, // 5 minutes in seconds
    };
  }

  /**
   * Verify OTP and login/register user
   */
  async verifyOtp(otpVerifyDto: OtpVerifyDto): Promise<AuthResponseDto> {
    const { phone, otp } = otpVerifyDto;

    // Check OTP
    const storedOtp = this.otpStore.get(phone);
    if (!storedOtp) {
      throw new BadRequestException('OTP expired or not requested');
    }

    if (storedOtp.expiresAt < Date.now()) {
      this.otpStore.delete(phone);
      throw new BadRequestException('OTP expired');
    }

    if (storedOtp.attempts >= 3) {
      this.otpStore.delete(phone);
      throw new UnauthorizedException('Too many failed OTP attempts');
    }

    if (storedOtp.otp !== otp) {
      storedOtp.attempts++;
      throw new BadRequestException('Invalid OTP');
    }

    // OTP verified - clear from store
    this.otpStore.delete(phone);

    // Find or create user
    let user = await this.userRepository.findByPhone(phone);

    if (!user) {
      // Find customer role
      const customerRole = await this.userRepository.manager.findOne(Role, {
        where: { type: 'customer' },
      });
      if (!customerRole) {
        throw new BadRequestException('Customer role not found');
      }

      // Auto-create customer account on first OTP verification
      user = this.userRepository.create({
        phone,
        firstName: 'Customer',
        lastName: '',
        userType: 'customer',
        roleId: customerRole.id,
        phoneVerified: true,
        isActive: true,
      });
      user = await this.userRepository.save(user);
    } else {
      // Mark phone as verified
      await this.userRepository.markPhoneVerified(user.id);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: this.mapUserToResponse(user),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<JwtResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      // Check if refresh token is not revoked (stored in map)
      const storedToken = this.jwtRefreshTokenStore.get(refreshToken);
      if (!storedToken || storedToken.expiresAt < Date.now()) {
        throw new UnauthorizedException('Refresh token expired or revoked');
      }

      // Get fresh user data
      const user = await this.userRepository.findByIdWithRoles(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens (with token rotation)
      const newTokens = await this.generateTokens(user);

      // Revoke old refresh token by removing from store
      this.jwtRefreshTokenStore.delete(refreshToken);

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(user: User): Promise<JwtResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      roles: user.role ? [user.role.type] : [],
      permissions: user.role?.permissions?.map((p) => p.name) || [],
    };

    const accessTokenExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTokenExpiresIn as any,
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshTokenExpiresIn as any,
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }),
    ]);

    // Store refresh token (with expiry) for revocation
    const refreshTokenExpiresAt = Date.now() + this.parseExpiresIn(refreshTokenExpiresIn);
    this.jwtRefreshTokenStore.set(refreshToken, {
      expiresAt: refreshTokenExpiresAt,
    });

    // Get expiration time in seconds for response
    const decodedAccess = this.jwtService.decode(accessToken) as any;
    const expiresIn = decodedAccess.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Parse expiration string (e.g., "7d", "24h", "15m") to milliseconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/(\d+)([dhms])/);
    if (!match) return 0;

    const [, value, unit] = match;
    const multipliers: Record<string, number> = {
      d: 24 * 60 * 60 * 1000,
      h: 60 * 60 * 1000,
      m: 60 * 1000,
      s: 1000,
    };

    return parseInt(value) * (multipliers[unit] || 0);
  }

  /**
   * Map User entity to response DTO
   */
  private mapUserToResponse(user: User) {
    return {
      id: user.id,
      email: user.email || '',
      phone: user.phone,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      userType: user.userType,
      avatar: user.avatar,
    };
  }
}
