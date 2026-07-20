/**
 * Auth DTOs - Data Transfer Objects for authentication
 */

export class RegisterDto {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'provider' | 'admin';
}

export class LoginDto {
  email?: string;
  phone?: string;
  password: string;
}

export class OtpRequestDto {
  phone: string;
}

export class OtpVerifyDto {
  phone: string;
  otp: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ResetPasswordRequestDto {
  email: string;
}

export class ResetPasswordDto {
  token: string;
  newPassword: string;
}

export class GoogleAuthDto {
  idToken: string;
  userType: 'customer' | 'provider';
}

export class AppleAuthDto {
  identityToken: string;
  userType: 'customer' | 'provider';
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    userType: string;
    avatar?: string;
  };
}

export class OtpResponseDto {
  success: boolean;
  message: string;
  expiresIn: number;
}
