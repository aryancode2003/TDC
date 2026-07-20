import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  foodRating: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  tasteRating: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  packagingRating: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  deliveryRating: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  quantityRating: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsArray()
  @IsOptional()
  videos?: string[];
}

export class ReviewResponseDto {
  id: string;
  customerId: string;
  providerId: string;
  orderId?: string;
  subscriptionId?: string;
  foodRating: number;
  tasteRating: number;
  packagingRating: number;
  deliveryRating: number;
  quantityRating: number;
  overallRating: number;
  title: string;
  description: string;
  photos: string[];
  videos: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  isVisible: boolean;
  createdAt: Date;
}
