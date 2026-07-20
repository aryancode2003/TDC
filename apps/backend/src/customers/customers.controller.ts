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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { UpdateCustomerProfileDto, CustomerResponseDto } from './dto/customer.dto';
import { CreateAddressDto, UpdateAddressDto, AddressResponseDto } from './dto/address.dto';
import { SearchProvidersQueryDto } from './dto/discovery.dto';
import { CreateReviewDto, ReviewResponseDto } from './dto/review.dto';
import { CreateWaitlistDto, WaitlistResponseDto } from './dto/waitlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/roles.decorator';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // ==========================================
  // CUSTOMER PROFILE
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current customer profile details' })
  @ApiResponse({ status: 200, description: 'Customer profile data retrieved successfully', type: CustomerResponseDto })
  async getProfile(@Request() req: any): Promise<CustomerResponseDto> {
    return this.customersService.getCustomerProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Patch('profile')
  @ApiOperation({ summary: 'Update customer profile preferences and details' })
  @ApiResponse({ status: 200, description: 'Customer profile updated successfully', type: CustomerResponseDto })
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateCustomerProfileDto,
  ): Promise<CustomerResponseDto> {
    return this.customersService.updateCustomerProfile(req.user.sub, dto);
  }

  // ==========================================
  // ADDRESS MANAGEMENT
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new delivery address' })
  @ApiResponse({ status: 201, description: 'Address created successfully', type: AddressResponseDto })
  async createAddress(
    @Request() req: any,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.customersService.createAddress(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Get('addresses')
  @ApiOperation({ summary: 'List all delivery addresses' })
  @ApiResponse({ status: 200, description: 'Addresses listed successfully', type: [AddressResponseDto] })
  async listAddresses(@Request() req: any): Promise<AddressResponseDto[]> {
    return this.customersService.listAddresses(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Get('addresses/:id')
  @ApiOperation({ summary: 'Get specific address details' })
  @ApiResponse({ status: 200, description: 'Address details retrieved successfully', type: AddressResponseDto })
  async getAddress(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    return this.customersService.getAddress(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update specific address details' })
  @ApiResponse({ status: 200, description: 'Address updated successfully', type: AddressResponseDto })
  async updateAddress(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.customersService.updateAddress(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete delivery address' })
  @ApiResponse({ status: 204, description: 'Address deleted successfully' })
  async deleteAddress(@Request() req: any, @Param('id') id: string): Promise<void> {
    await this.customersService.deleteAddress(req.user.sub, id);
  }

  // ==========================================
  // PROVIDER DISCOVERY & PLANS
  // ==========================================

  @UseGuards(OptionalJwtAuthGuard)
  @Get('providers')
  @ApiOperation({ summary: 'Discover/search verified active tiffin providers' })
  @ApiResponse({ status: 200, description: 'List of providers retrieved successfully' })
  async searchProviders(@Query() query: SearchProvidersQueryDto) {
    return this.customersService.searchProviders(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('providers/:id')
  @ApiOperation({ summary: 'Get detailed provider profile, slots, and areas' })
  @ApiResponse({ status: 200, description: 'Provider details retrieved successfully' })
  async getProviderDetails(@Param('id') id: string) {
    return this.customersService.getProviderDetails(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('providers/:id/menu')
  @ApiOperation({ summary: 'Browse menu categories and meals for a provider' })
  @ApiResponse({ status: 200, description: 'Provider menu retrieved successfully' })
  async getProviderMenu(@Param('id') id: string) {
    return this.customersService.getProviderMenu(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('providers/:id/plans')
  @ApiOperation({ summary: 'List active subscription plans for a provider' })
  @ApiResponse({ status: 200, description: 'Provider subscription plans retrieved successfully' })
  async getProviderPlans(@Param('id') id: string) {
    return this.customersService.getProviderPlans(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('plans/:id')
  @ApiOperation({ summary: 'Get subscription plan details with scheduled meals' })
  @ApiResponse({ status: 200, description: 'Plan details retrieved successfully' })
  async getPlanDetails(@Param('id') id: string) {
    return this.customersService.getPlanDetails(id);
  }

  // ==========================================
  // REVIEWS & RATINGS SYSTEM
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Post('reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Post a new review for a provider' })
  @ApiResponse({ status: 201, description: 'Review posted successfully', type: ReviewResponseDto })
  async createReview(
    @Request() req: any,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.customersService.createReview(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @Get('reviews/my')
  @ApiOperation({ summary: 'List reviews written by the logged-in customer' })
  @ApiResponse({ status: 200, description: 'My reviews retrieved successfully', type: [ReviewResponseDto] })
  async getMyReviews(@Request() req: any): Promise<ReviewResponseDto[]> {
    return this.customersService.getCustomerReviews(req.user.sub);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('providers/:id/reviews')
  @ApiOperation({ summary: 'Get reviews for a specific provider' })
  @ApiResponse({ status: 200, description: 'Provider reviews retrieved successfully', type: [ReviewResponseDto] })
  async getProviderReviews(@Param('id') id: string): Promise<ReviewResponseDto[]> {
    return this.customersService.getProviderReviews(id);
  }

  // ==========================================
  // WAITLIST MANAGEMENT
  // ==========================================

  @Public()
  @Post('waitlist')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Join waitlist for coverage demand tracking' })
  @ApiResponse({ status: 201, description: 'Successfully joined waitlist', type: WaitlistResponseDto })
  async addToWaitlist(@Body() dto: CreateWaitlistDto): Promise<WaitlistResponseDto> {
    return this.customersService.addToWaitlist(dto);
  }
}
