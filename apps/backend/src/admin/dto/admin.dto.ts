import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export class UpdateProviderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['pending', 'approved', 'rejected', 'suspended', 'blacklisted'])
  verificationStatus: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionRate?: number;
}

export class UpdateSystemSettingDto {
  @IsNotEmpty()
  value: any;
}

export class WaitlistConversionDto {
  @IsString()
  @IsNotEmpty()
  pincode: string;
}

export class GlobalAnalyticsResponseDto {
  totalGMV: number;
  totalRevenue: number;
  activeProviders: number;
  activeCustomers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalOrders: number;
  waitlistCount: number;
}
