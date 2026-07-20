/**
 * Auth Controller
 * Endpoints for authentication: login, register, OTP, token refresh
 */

import { Controller, Post, Body, UseGuards, Get, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, OtpRequestDto, OtpVerifyDto, AuthResponseDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/roles.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register new user
   * Creates account for customer, provider, or admin
   */
  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login with email/phone and password
   */
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email/phone and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Request OTP for phone verification
   * Used for passwordless phone login
   */
  @Public()
  @Post('otp/request')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request OTP for phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async requestOtp(@Body() otpRequestDto: OtpRequestDto): Promise<{ expiresIn: number }> {
    return this.authService.requestOtp(otpRequestDto);
  }

  /**
   * Verify OTP and login/register
   * If user doesn't exist, automatically creates customer account
   */
  @Public()
  @Post('otp/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP and login' })
  @ApiResponse({ status: 200, description: 'OTP verified, user logged in', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() otpVerifyDto: OtpVerifyDto): Promise<AuthResponseDto> {
    return this.authService.verifyOtp(otpVerifyDto);
  }

  /**
   * Refresh access token
   * Uses refresh token to get new access token
   */
  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New tokens generated' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Get current user info
   * Protected endpoint - requires valid JWT
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Current user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: any) {
    return {
      id: req.user.sub,
      email: req.user.email,
      phone: req.user.phone,
      userType: req.user.userType,
      roles: req.user.roles,
      permissions: req.user.permissions,
    };
  }
}
