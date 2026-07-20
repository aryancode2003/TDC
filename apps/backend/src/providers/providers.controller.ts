import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { RegisterProviderDto, UpdateProviderProfileDto, ProviderResponseDto } from './dto/provider.dto';
import {
  CreateMealCategoryDto,
  UpdateMealCategoryDto,
  CreateMealDto,
  UpdateMealDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  ConfigurePlanMealsDto,
} from './dto/menu.dto';
import {
  CreateServiceAreaDto,
  CreateDeliverySlotDto,
  UpdateDeliverySlotDto,
  SetKitchenCapacityDto,
} from './dto/provider-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Providers')
@Controller('providers')
@ApiBearerAuth()
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  /**
   * Onboard a user as a Provider
   */
  @UseGuards(JwtAuthGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Onboard current user as a Tiffin Provider' })
  @ApiResponse({ status: 201, description: 'Provider onboarded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Provider profile already exists' })
  async register(
    @Request() req: any,
    @Body() registerDto: RegisterProviderDto,
  ): Promise<ProviderResponseDto> {
    return this.providersService.registerProvider(req.user.sub, registerDto) as any;
  }

  /**
   * Get provider profile
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Get('profile')
  @ApiOperation({ summary: 'Get current provider profile' })
  @ApiResponse({ status: 200, description: 'Provider profile data' })
  @ApiResponse({ status: 404, description: 'Provider profile not found' })
  async getProfile(@Request() req: any): Promise<ProviderResponseDto> {
    return this.providersService.getProviderProfile(req.user.sub) as any;
  }

  /**
   * Update provider profile
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Patch('profile')
  @ApiOperation({ summary: 'Update provider profile details' })
  @ApiResponse({ status: 200, description: 'Provider profile updated successfully' })
  async updateProfile(
    @Request() req: any,
    @Body() updateDto: UpdateProviderProfileDto,
  ): Promise<ProviderResponseDto> {
    return this.providersService.updateProviderProfile(req.user.sub, updateDto) as any;
  }

  // ==========================================
  // MENU CATEGORIES
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Post('menu/categories')
  @ApiOperation({ summary: 'Create a new meal category' })
  async createCategory(@Request() req: any, @Body() dto: CreateMealCategoryDto) {
    return this.providersService.createMealCategory(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Patch('menu/categories/:id')
  @ApiOperation({ summary: 'Update a meal category' })
  async updateCategory(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMealCategoryDto,
  ) {
    return this.providersService.updateMealCategory(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Delete('menu/categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a meal category' })
  async deleteCategory(@Request() req: any, @Param('id') id: string) {
    await this.providersService.deleteMealCategory(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Get('menu/categories')
  @ApiOperation({ summary: 'Get all meal categories' })
  async getCategories(@Request() req: any) {
    return this.providersService.getMealCategories(req.user.sub);
  }

  // ==========================================
  // MEALS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Post('menu/meals')
  @ApiOperation({ summary: 'Create a new meal item' })
  async createMeal(@Request() req: any, @Body() dto: CreateMealDto) {
    return this.providersService.createMeal(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Patch('menu/meals/:id')
  @ApiOperation({ summary: 'Update a meal item' })
  async updateMeal(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
  ) {
    return this.providersService.updateMeal(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Delete('menu/meals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a meal item' })
  async deleteMeal(@Request() req: any, @Param('id') id: string) {
    await this.providersService.deleteMeal(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Get('menu/meals')
  @ApiOperation({ summary: 'Get all meal items' })
  @ApiQuery({ name: 'categoryId', required: false })
  async getMeals(@Request() req: any, @Query('categoryId') categoryId?: string) {
    return this.providersService.getMeals(req.user.sub, categoryId);
  }

  // ==========================================
  // SUBSCRIPTION PLANS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Post('plans')
  @ApiOperation({ summary: 'Create a new subscription plan' })
  async createPlan(@Request() req: any, @Body() dto: CreateSubscriptionPlanDto) {
    return this.providersService.createPlan(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update a subscription plan' })
  async updatePlan(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.providersService.updatePlan(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Delete('plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subscription plan' })
  async deletePlan(@Request() req: any, @Param('id') id: string) {
    await this.providersService.deletePlan(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  async getPlans(@Request() req: any) {
    return this.providersService.getPlans(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Post('plans/:id/meals')
  @ApiOperation({ summary: 'Configure meals in a subscription plan' })
  async configureMeals(
    @Request() req: any,
    @Param('id') planId: string,
    @Body() dto: ConfigurePlanMealsDto,
  ) {
    return this.providersService.configurePlanMeals(req.user.sub, planId, dto);
  }

  // ==========================================
  // SERVICE AREAS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Post('service-areas')
  @ApiOperation({ summary: 'Add a new service area pincode' })
  async addServiceArea(@Request() req: any, @Body() dto: CreateServiceAreaDto) {
    return this.providersService.addServiceArea(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Delete('service-areas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a service area pincode' })
  async removeServiceArea(@Request() req: any, @Param('id') id: string) {
    await this.providersService.removeServiceArea(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Get('service-areas')
  @ApiOperation({ summary: 'Get all service areas' })
  async getServiceAreas(@Request() req: any) {
    return this.providersService.getServiceAreas(req.user.sub);
  }

  // ==========================================
  // DELIVERY SLOTS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Post('delivery-slots')
  @ApiOperation({ summary: 'Add a new delivery slot' })
  async addDeliverySlot(@Request() req: any, @Body() dto: CreateDeliverySlotDto) {
    return this.providersService.addDeliverySlot(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Patch('delivery-slots/:id')
  @ApiOperation({ summary: 'Update a delivery slot' })
  async updateDeliverySlot(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDeliverySlotDto,
  ) {
    return this.providersService.updateDeliverySlot(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Delete('delivery-slots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a delivery slot' })
  async removeDeliverySlot(@Request() req: any, @Param('id') id: string) {
    await this.providersService.removeDeliverySlot(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Get('delivery-slots')
  @ApiOperation({ summary: 'Get all delivery slots' })
  async getDeliverySlots(@Request() req: any) {
    return this.providersService.getDeliverySlots(req.user.sub);
  }

  // ==========================================
  // KITCHEN CAPACITY
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Post('kitchen-capacity')
  @ApiOperation({ summary: 'Set kitchen capacity for a specific date and meal type' })
  async setKitchenCapacity(@Request() req: any, @Body() dto: SetKitchenCapacityDto) {
    return this.providersService.setKitchenCapacity(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @Get('kitchen-capacity')
  @ApiOperation({ summary: 'Get kitchen capacities by date range' })
  @ApiQuery({ name: 'startDate', type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', type: String, description: 'YYYY-MM-DD' })
  async getKitchenCapacities(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.providersService.getKitchenCapacities(
      req.user.sub,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
