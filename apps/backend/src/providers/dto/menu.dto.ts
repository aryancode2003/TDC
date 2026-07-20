import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMealCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateMealCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsEnum(['veg', 'non-veg', 'jain'])
  type: string;

  @IsEnum(['normal', 'healthy', 'gym', 'diet'])
  @IsOptional()
  specialization?: string;

  @IsNumber()
  @IsOptional()
  calorieCount?: number;

  @IsNumber()
  @IsOptional()
  preparationTime?: number;

  @IsNumber()
  @IsOptional()
  servings?: number;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  nutrients?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];
}

export class UpdateMealDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsEnum(['veg', 'non-veg', 'jain'])
  @IsOptional()
  type?: string;

  @IsEnum(['normal', 'healthy', 'gym', 'diet'])
  @IsOptional()
  specialization?: string;

  @IsNumber()
  @IsOptional()
  calorieCount?: number;

  @IsNumber()
  @IsOptional()
  preparationTime?: number;

  @IsNumber()
  @IsOptional()
  servings?: number;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  nutrients?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];
}

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['weekly', 'biweekly', 'monthly', 'quarterly', 'custom'])
  planType: string;

  @IsNumber()
  @IsNotEmpty()
  durationDays: number;

  @IsNumber()
  @IsNotEmpty()
  basePrice: number;

  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @IsNumber()
  @IsOptional()
  deliveryCharges?: number;

  @IsNumber()
  @IsOptional()
  packagingCharges?: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsNumber()
  @IsOptional()
  taxPercentage?: number;

  @IsObject()
  @IsOptional()
  includedCategories?: Record<string, any>;
}

export class UpdateSubscriptionPlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['weekly', 'biweekly', 'monthly', 'quarterly', 'custom'])
  @IsOptional()
  planType?: string;

  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @IsNumber()
  @IsOptional()
  deliveryCharges?: number;

  @IsNumber()
  @IsOptional()
  packagingCharges?: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsNumber()
  @IsOptional()
  taxPercentage?: number;

  @IsObject()
  @IsOptional()
  includedCategories?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class PlanMealItemDto {
  @IsString()
  @IsNotEmpty()
  mealId: string;

  @IsNumber()
  @IsNotEmpty()
  day: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class ConfigurePlanMealsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanMealItemDto)
  meals: PlanMealItemDto[];
}
