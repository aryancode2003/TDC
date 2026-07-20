import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsObject } from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsString()
  @IsOptional()
  locality?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsNumber()
  @IsOptional()
  deliveryRadius?: number;
}

export class CreateDeliverySlotDto {
  @IsEnum(['breakfast', 'lunch', 'dinner'])
  mealType: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  maxCapacity: number;

  @IsObject()
  @IsNotEmpty()
  serviceDays: Record<string, boolean>;
}

export class UpdateDeliverySlotDto {
  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @IsOptional()
  maxCapacity?: number;

  @IsObject()
  @IsOptional()
  serviceDays?: Record<string, boolean>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SetKitchenCapacityDto {
  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD format

  @IsEnum(['breakfast', 'lunch', 'dinner'])
  mealType: string;

  @IsNumber()
  @IsNotEmpty()
  maxCapacity: number;
}
