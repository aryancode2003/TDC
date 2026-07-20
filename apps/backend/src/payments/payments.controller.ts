import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, VerifyPaymentDto, PaymentResponseDto } from './dto/payment.dto';
import { LoadWalletDto, WalletResponseDto, WalletTransactionResponseDto } from './dto/wallet.dto';
import { CreateCouponDto, ApplyCouponDto, CouponResponseDto } from './dto/coupon.dto';
import { ProcessSettlementDto, SettlementResponseDto } from './dto/settlement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProviderRepository } from '../providers/repositories/provider.repository';

@ApiTags('Payments & Financials')
@Controller('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly providerRepository: ProviderRepository,
  ) {}

  // ==========================================
  // CHECKOUT & VERIFICATION
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a payment order via checkout' })
  @ApiResponse({ status: 201, description: 'Checkout payment order initialized', type: PaymentResponseDto })
  async checkout(
    @Request() req: any,
    @Body() dto: InitiatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.initiatePayment(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment details using Razorpay signatures' })
  @ApiResponse({ status: 200, description: 'Signature verified, subscription/order updated', type: PaymentResponseDto })
  async verify(
    @Request() req: any,
    @Body() dto: VerifyPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.verifyPayment(req.user.sub, dto);
  }

  // ==========================================
  // WALLET OPERATIONS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Get('wallet')
  @ApiOperation({ summary: 'Get current customer wallet balance' })
  @ApiResponse({ status: 200, description: 'Customer wallet details', type: WalletResponseDto })
  async getWallet(@Request() req: any): Promise<WalletResponseDto> {
    return this.paymentsService.getWallet(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Get('wallet/transactions')
  @ApiOperation({ summary: 'Get history of wallet transactions' })
  @ApiResponse({ status: 200, description: 'Wallet transactions list', type: [WalletTransactionResponseDto] })
  async getWalletTransactions(@Request() req: any): Promise<WalletTransactionResponseDto[]> {
    return this.paymentsService.getWalletTransactions(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post('wallet/load')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Load money into customer wallet' })
  @ApiResponse({ status: 200, description: 'Wallet credited successfully', type: WalletResponseDto })
  async loadWallet(
    @Request() req: any,
    @Body() dto: LoadWalletDto,
  ): Promise<WalletResponseDto> {
    return this.paymentsService.loadWallet(req.user.sub, dto);
  }

  // ==========================================
  // DISCOUNT COUPONS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner', 'admin', 'super_admin')
  @Post('coupons')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new coupon code (Admins & Providers)' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully', type: CouponResponseDto })
  async createCoupon(
    @Request() req: any,
    @Body() dto: CreateCouponDto,
  ): Promise<CouponResponseDto> {
    // For partners, enforce they can only create coupons for their own provider business
    if (req.user.roles?.includes('partner')) {
      const provider = await this.providerRepository.findByUserId(req.user.sub);
      if (!provider || provider.id !== dto.providerId) {
        throw new ForbiddenException('You can only create coupons for your own provider business.');
      }
    }
    return this.paymentsService.createCoupon(dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('coupons')
  @ApiOperation({ summary: 'List active coupons (Optionally filter by provider ID)' })
  @ApiQuery({ name: 'providerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Active coupons list', type: [CouponResponseDto] })
  async getCoupons(@Query('providerId') providerId?: string): Promise<CouponResponseDto[]> {
    return this.paymentsService.getCoupons(providerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post('coupons/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and calculate discount for a coupon' })
  @ApiResponse({ status: 200, description: 'Coupon details & calculated discount values' })
  async applyCoupon(
    @Request() req: any,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.paymentsService.validateAndApplyCoupon(req.user.sub, dto);
  }

  // ==========================================
  // SETTLEMENTS & PAYOUTS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Post('settlements/process')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process payout settlement for a provider over date range (Admins only)' })
  @ApiResponse({ status: 201, description: 'Settlement aggregated and processed', type: SettlementResponseDto })
  async processSettlement(@Body() dto: ProcessSettlementDto): Promise<SettlementResponseDto> {
    return this.paymentsService.processSettlement(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner', 'admin', 'super_admin')
  @Get('settlements/provider/:providerId')
  @ApiOperation({ summary: 'List settlements processed for a specific provider' })
  @ApiResponse({ status: 200, description: 'Provider settlements list', type: [SettlementResponseDto] })
  async listSettlements(
    @Request() req: any,
    @Param('providerId') providerId: string,
  ): Promise<SettlementResponseDto[]> {
    // If user is partner, make sure they are querying their own provider settlements
    if (req.user.roles?.includes('partner')) {
      const provider = await this.providerRepository.findByUserId(req.user.sub);
      if (!provider || provider.id !== providerId) {
        throw new ForbiddenException('You can only query settlements for your own provider business.');
      }
    }
    return this.paymentsService.listSettlements(providerId);
  }
}
