import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum, IsDateString, IsObject } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  providerId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usageLimit?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  limitPerCustomer?: number;

  @IsObject()
  @IsOptional()
  applicableMealTypes?: Record<string, any>;

  @IsObject()
  @IsOptional()
  applicableCategories?: Record<string, any>;
}

export class ApplyCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  mealType?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class CouponResponseDto {
  id: string;
  code: string;
  providerId?: string;
  description?: string;
  discountType: string;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number;
  usageCount: number;
  limitPerCustomer: number;
  isActive: boolean;
  applicableMealTypes: Record<string, any>;
  applicableCategories: Record<string, any>;
  createdAt: Date;
}
