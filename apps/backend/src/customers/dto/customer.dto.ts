import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  preferredProviderId?: string;

  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}

export class CustomerUserResponseDto {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export class CustomerResponseDto {
  id: string;
  userId: string;
  user?: CustomerUserResponseDto;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalSpent: number;
  avgRating: number;
  totalReviews: number;
  preferredProviderId?: string;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
