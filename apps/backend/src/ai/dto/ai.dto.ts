import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ForecastQueryDto {
  @IsNumber()
  @Min(1)
  @Max(30)
  @IsOptional()
  @Type(() => Number)
  days?: number = 7;
}

export class DailyForecastDto {
  date: string;
  dayOfWeek: string;
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  confidence: number;
  factors: string[];
}

export class ProviderForecastResponseDto {
  providerId: string;
  businessName: string;
  timeframeDays: number;
  generatedAt: string;
  forecast: DailyForecastDto[];
  insights: string[];
}

export class ChurnRiskCustomerDto {
  customerId: string;
  customerName: string;
  phone: string;
  riskScore: number; // 0 to 100
  riskLevel: 'low' | 'medium' | 'high';
  lastActivityDate: string;
  activeSubscriptionsCount: number;
  vacationDaysCount: number;
  averageRatingGiven: number | null;
  riskFactors: string[];
}

export class ChurnAnalysisResponseDto {
  generatedAt: string;
  totalCustomersAnalyzed: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
  highRiskCustomers: ChurnRiskCustomerDto[];
}

export class MealRecommendationDto {
  mealId: string;
  mealName: string;
  providerId: string;
  providerName: string;
  price: number;
  calorieCount: number;
  type: 'veg' | 'non-veg' | 'jain';
  specialization: 'normal' | 'healthy' | 'gym' | 'diet';
  matchScore: number; // 0 to 100
  reasons: string[];
}

export class CustomerRecommendationsResponseDto {
  customerId: string;
  customerName: string;
  dietaryPreference: string;
  pincode: string;
  recommendations: MealRecommendationDto[];
}
