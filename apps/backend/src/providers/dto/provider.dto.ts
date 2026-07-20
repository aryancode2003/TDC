import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class RegisterProviderDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  gstNumber: string;

  @IsString()
  @IsNotEmpty()
  panNumber: string;

  @IsString()
  @IsNotEmpty()
  fssaiNumber: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  bankDetails?: Record<string, any>;

  @IsObject()
  @IsOptional()
  verificationDocuments?: Record<string, any>;
}

export class UpdateProviderProfileDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  businessLogo?: string;

  @IsString()
  @IsOptional()
  businessBanner?: string;

  @IsObject()
  @IsOptional()
  bankDetails?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ProviderResponseDto {
  id: string;
  userId: string;
  businessName: string;
  businessLogo?: string;
  businessBanner?: string;
  description?: string;
  gstNumber: string;
  panNumber: string;
  fssaiNumber: string;
  verificationStatus: string;
  avgRating: number;
  totalReviews: number;
  mealsDelivered: number;
  activeSubscribers: number;
  totalSubscriptions: number;
  bankDetails: Record<string, any>;
  verificationDocuments: Record<string, any>;
  isActive: boolean;
  approvedAt?: Date;
  createdAt: Date;
}
