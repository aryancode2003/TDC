import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  ForecastQueryDto, 
  ProviderForecastResponseDto, 
  ChurnAnalysisResponseDto, 
  CustomerRecommendationsResponseDto 
} from './dto/ai.dto';

@ApiTags('AI Features & Analytics')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('providers/:providerId/forecast')
  @Roles('admin', 'super_admin', 'partner')
  @ApiOperation({ summary: 'Predict daily tiffin meal demand for a provider (Admins & Partners)' })
  @ApiResponse({ status: 200, description: 'Demand forecast predictions generated', type: ProviderForecastResponseDto })
  async getProviderForecast(
    @Param('providerId') providerId: string,
    @Query() query: ForecastQueryDto,
  ): Promise<ProviderForecastResponseDto> {
    return this.aiService.getProviderDemandForecast(providerId, query.days);
  }

  @Get('admin/churn-prediction')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Identify customers at high risk of cancelling their subscriptions (Admins only)' })
  @ApiResponse({ status: 200, description: 'Customer churn analysis results', type: ChurnAnalysisResponseDto })
  async getChurnPrediction(): Promise<ChurnAnalysisResponseDto> {
    return this.aiService.getChurnRiskAnalysis();
  }

  @Get('customers/:customerId/recommendations')
  @Roles('admin', 'super_admin', 'customer')
  @ApiOperation({ summary: 'Generate smart personalized meal and provider suggestions for a customer' })
  @ApiResponse({ status: 200, description: 'Personalized recommendations generated', type: CustomerRecommendationsResponseDto })
  async getRecommendations(
    @Param('customerId') customerId: string,
  ): Promise<CustomerRecommendationsResponseDto> {
    return this.aiService.getCustomerRecommendations(customerId);
  }
}
