/**
 * JWT Payload Interface
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  phone?: string;
  userType: string;
  tenantId?: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface OtpPayload {
  phone: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
