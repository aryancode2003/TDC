import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Between } from 'typeorm';
import { PaymentRepository } from './repositories/payment.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletTransactionRepository } from './repositories/wallet-transaction.repository';
import { CouponRepository } from './repositories/coupon.repository';
import { SettlementRepository } from './repositories/settlement.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ProviderRepository } from '../providers/repositories/provider.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { Payment, Wallet, WalletTransaction, Coupon, Settlement, Subscription, Order } from '../database/entities';
import { InitiatePaymentDto, VerifyPaymentDto, PaymentResponseDto } from './dto/payment.dto';
import { LoadWalletDto, WalletResponseDto, WalletTransactionResponseDto } from './dto/wallet.dto';
import { CreateCouponDto, ApplyCouponDto, CouponResponseDto } from './dto/coupon.dto';
import { ProcessSettlementDto, SettlementResponseDto } from './dto/settlement.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private paymentRepository: PaymentRepository,
    private walletRepository: WalletRepository,
    private walletTransactionRepository: WalletTransactionRepository,
    private couponRepository: CouponRepository,
    private settlementRepository: SettlementRepository,
    private customerRepository: CustomerRepository,
    private providerRepository: ProviderRepository,
    private userRepository: UserRepository,
  ) {}

  // ==========================================
  // PAYMENT FLOWS
  // ==========================================

  async initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<PaymentResponseDto> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found. Please onboard first.');
    }

    const provider = await this.providerRepository.findOne({ where: { id: dto.providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${dto.providerId} not found.`);
    }

    // Verify Subscription or Order if specified
    if (dto.subscriptionId) {
      const sub = await this.paymentRepository.manager.findOne(Subscription, {
        where: { id: dto.subscriptionId },
      });
      if (!sub) {
        throw new NotFoundException(`Subscription with ID ${dto.subscriptionId} not found.`);
      }
    }

    if (dto.orderId) {
      const ord = await this.paymentRepository.manager.findOne(Order, {
        where: { id: dto.orderId },
      });
      if (!ord) {
        throw new NotFoundException(`Order with ID ${dto.orderId} not found.`);
      }
    }

    // Calculate Platform Commission and Payout Shares
    const commissionRate = provider.commissionRate || 15;
    const platformCommission = parseFloat((dto.amount * (commissionRate / 100)).toFixed(2));
    const gatewayCharges = parseFloat((dto.amount * 0.02).toFixed(2)); // Standard 2% payment gateway charge
    const providerAmount = parseFloat((dto.amount - platformCommission - gatewayCharges).toFixed(2));

    // Mock Razorpay Order ID generation
    const mockRazorpayOrderId = `order_${uuidv4().replace(/-/g, '').substring(0, 14)}`;

    const payment = this.paymentRepository.create({
      customerId: customer.id,
      providerId: dto.providerId,
      subscriptionId: dto.subscriptionId,
      orderId: dto.orderId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod || 'upi',
      status: 'pending',
      razorpayOrderId: mockRazorpayOrderId,
      platformCommission,
      gatewayCharges,
      providerAmount,
      metadata: {},
    });

    const saved = await this.paymentRepository.save(payment);
    return this.mapToPaymentResponseDto(saved);
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByRazorpayOrderId(dto.razorpayOrderId);
    if (!payment) {
      throw new NotFoundException(`Payment with Razorpay Order ID ${dto.razorpayOrderId} not found.`);
    }

    if (payment.status === 'completed') {
      return this.mapToPaymentResponseDto(payment);
    }

    // Update payment details
    payment.status = 'completed';
    payment.razorpayPaymentId = dto.razorpayPaymentId;
    payment.razorpaySignature = dto.razorpaySignature;
    payment.completedAt = new Date();

    await this.paymentRepository.save(payment);

    // Update the linked Subscription or Order state
    if (payment.subscriptionId) {
      const sub = await this.paymentRepository.manager.findOne(Subscription, {
        where: { id: payment.subscriptionId },
      });
      if (sub) {
        sub.status = 'active';
        sub.paidAmount = (sub.paidAmount || 0) + payment.amount;
        sub.remainingAmount = Math.max(0, (sub.totalPrice || 0) - sub.paidAmount);
        await this.paymentRepository.manager.save(sub);

        // Update customer total subscription stats
        const customer = await this.customerRepository.findOne({ where: { id: payment.customerId } });
        if (customer) {
          customer.totalSubscriptions = (customer.totalSubscriptions || 0) + 1;
          customer.activeSubscriptions = (customer.activeSubscriptions || 0) + 1;
          customer.totalSpent = (customer.totalSpent || 0) + payment.amount;
          await this.customerRepository.save(customer);
        }
      }
    }

    if (payment.orderId) {
      const ord = await this.paymentRepository.manager.findOne(Order, {
        where: { id: payment.orderId },
      });
      if (ord) {
        ord.status = 'confirmed';
        await this.paymentRepository.manager.save(ord);
      }
    }

    return this.mapToPaymentResponseDto(payment);
  }

  // ==========================================
  // WALLET MANAGEMENT
  // ==========================================

  async getOrCreateWallet(customerId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findByCustomerId(customerId);
    if (!wallet) {
      wallet = this.walletRepository.create({
        customerId,
        balance: 0,
        totalCredits: 0,
        totalRefunds: 0,
        totalCashback: 0,
        totalReferralBonus: 0,
      });
      wallet = await this.walletRepository.save(wallet);
    }
    return wallet;
  }

  async getWallet(userId: string): Promise<WalletResponseDto> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found.');
    }
    const wallet = await this.getOrCreateWallet(customer.id);
    return this.mapToWalletResponseDto(wallet);
  }

  async getWalletTransactions(userId: string): Promise<WalletTransactionResponseDto[]> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found.');
    }
    const list = await this.walletTransactionRepository.findByCustomerId(customer.id);
    return list.map(t => this.mapToTransactionResponseDto(t));
  }

  async loadWallet(userId: string, dto: LoadWalletDto): Promise<WalletResponseDto> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found.');
    }

    const wallet = await this.getOrCreateWallet(customer.id);
    const balanceBefore = wallet.balance;
    wallet.balance += dto.amount;
    wallet.totalCredits += dto.amount;

    const savedWallet = await this.walletRepository.save(wallet);

    // Create a transaction log
    const trans = this.walletTransactionRepository.create({
      walletId: wallet.id,
      customerId: customer.id,
      type: 'credit',
      amount: dto.amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description: 'Funds loaded via checkout gateway',
    });
    await this.walletTransactionRepository.save(trans);

    // Create a successful Payment log representation
    const payment = this.paymentRepository.create({
      customerId: customer.id,
      providerId: 'PLATFORM', // Load to wallet is a platform transaction
      amount: dto.amount,
      paymentMethod: 'wallet',
      status: 'completed',
      completedAt: new Date(),
      metadata: { action: 'wallet_load' },
    });
    await this.paymentRepository.save(payment);

    return this.mapToWalletResponseDto(savedWallet);
  }

  async debitWallet(customerId: string, amount: number, description: string, referenceId?: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(customerId);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance.');
    }

    const balanceBefore = wallet.balance;
    wallet.balance -= amount;

    const saved = await this.walletRepository.save(wallet);

    const trans = this.walletTransactionRepository.create({
      walletId: wallet.id,
      customerId,
      type: 'debit',
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      referenceId,
    });
    await this.walletTransactionRepository.save(trans);

    return saved;
  }

  async creditWallet(
    customerId: string,
    amount: number,
    type: 'refund' | 'cashback' | 'referral',
    description: string,
    referenceId?: string,
  ): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(customerId);
    const balanceBefore = wallet.balance;
    wallet.balance += amount;
    wallet.totalCredits += amount;

    if (type === 'refund') wallet.totalRefunds += amount;
    else if (type === 'cashback') wallet.totalCashback += amount;
    else if (type === 'referral') wallet.totalReferralBonus += amount;

    const saved = await this.walletRepository.save(wallet);

    const trans = this.walletTransactionRepository.create({
      walletId: wallet.id,
      customerId,
      type,
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      referenceId,
    });
    await this.walletTransactionRepository.save(trans);

    return saved;
  }

  // ==========================================
  // COUPON & DISCOUNT MANAGEMENT
  // ==========================================

  async createCoupon(dto: CreateCouponDto): Promise<CouponResponseDto> {
    const existing = await this.couponRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Coupon code ${dto.code} already exists.`);
    }

    const coupon = this.couponRepository.create({
      code: dto.code.toUpperCase(),
      providerId: dto.providerId || undefined,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxDiscount: dto.maxDiscount,
      minOrderAmount: dto.minOrderAmount,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
      usageLimit: dto.usageLimit || 0,
      usageCount: 0,
      limitPerCustomer: dto.limitPerCustomer || 1,
      isActive: true,
      applicableMealTypes: dto.applicableMealTypes || {},
      applicableCategories: dto.applicableCategories || {},
    });

    const saved = await this.couponRepository.save(coupon);
    return this.mapToCouponResponseDto(saved);
  }

  async getCoupons(providerId?: string): Promise<CouponResponseDto[]> {
    let list: Coupon[];
    if (providerId) {
      list = await this.couponRepository.findProviderCoupons(providerId);
    } else {
      list = await this.couponRepository.findActiveCoupons();
    }
    return list.map(c => this.mapToCouponResponseDto(c));
  }

  async validateAndApplyCoupon(userId: string, dto: ApplyCouponDto): Promise<{ discountAmount: number; finalAmount: number }> {
    const coupon = await this.couponRepository.findOne({
      where: { code: dto.code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      throw new BadRequestException(`Invalid or inactive coupon code ${dto.code}.`);
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new BadRequestException('This coupon has expired or is not yet valid.');
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit has been reached.');
    }

    if (coupon.minOrderAmount && dto.amount < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum purchase of ₹${coupon.minOrderAmount} required.`);
    }

    // Apply discount logic
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = dto.amount * (coupon.discountValue / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = parseFloat(discountAmount.toFixed(2));
    const finalAmount = parseFloat(Math.max(0, dto.amount - discountAmount).toFixed(2));

    return {
      discountAmount,
      finalAmount,
    };
  }

  // ==========================================
  // SETTLEMENTS ENGINE (PROVIDER PAYOUTS)
  // ==========================================

  async processSettlement(dto: ProcessSettlementDto): Promise<SettlementResponseDto> {
    const provider = await this.providerRepository.findOne({ where: { id: dto.providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${dto.providerId} not found.`);
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    // Align end date to end of day
    end.setHours(23, 59, 59, 999);

    // Verify if a settlement already exists for the provider in this date range
    const existing = await this.settlementRepository.findOne({
      where: {
        providerId: dto.providerId,
        startDate: start,
        endDate: end,
      },
    });

    if (existing) {
      throw new ConflictException(`Settlement for provider ${provider.businessName} has already been processed for this period.`);
    }

    // Get completed transactions for this provider
    const payments = await this.paymentRepository.find({
      where: {
        providerId: dto.providerId,
        status: 'completed',
        completedAt: Between(start, end),
      },
    });

    if (payments.length === 0) {
      throw new BadRequestException('No completed transactions found for this settlement period.');
    }

    const totalRevenue = parseFloat(payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2));
    const commissionAmount = parseFloat(payments.reduce((sum, p) => sum + p.platformCommission, 0).toFixed(2));
    const gatewayCharges = parseFloat(payments.reduce((sum, p) => sum + p.gatewayCharges, 0).toFixed(2));
    const netAmount = parseFloat((totalRevenue - commissionAmount - gatewayCharges).toFixed(2));

    const settlement = this.settlementRepository.create({
      providerId: dto.providerId,
      startDate: start,
      endDate: end,
      totalRevenue,
      commissionAmount,
      gatewayCharges,
      refunds: 0,
      netAmount,
      status: 'processed',
      paidAt: new Date(),
      bankDetails: provider.bankDetails || {},
    });

    const saved = await this.settlementRepository.save(settlement);
    return this.mapToSettlementResponseDto(saved);
  }

  async listSettlements(providerId: string): Promise<SettlementResponseDto[]> {
    const list = await this.settlementRepository.findByProviderId(providerId);
    return list.map(s => this.mapToSettlementResponseDto(s));
  }

  // ==========================================
  // MAPPER FUNCTIONS
  // ==========================================

  private mapToPaymentResponseDto(p: Payment): PaymentResponseDto {
    return {
      id: p.id,
      orderId: p.orderId,
      subscriptionId: p.subscriptionId,
      customerId: p.customerId,
      providerId: p.providerId,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      razorpayOrderId: p.razorpayOrderId,
      razorpayPaymentId: p.razorpayPaymentId,
      razorpaySignature: p.razorpaySignature,
      gatewayCharges: p.gatewayCharges,
      platformCommission: p.platformCommission,
      providerAmount: p.providerAmount,
      failureReason: p.failureReason,
      completedAt: p.completedAt,
      createdAt: p.createdAt,
    };
  }

  private mapToWalletResponseDto(w: Wallet): WalletResponseDto {
    return {
      id: w.id,
      customerId: w.customerId,
      balance: w.balance,
      totalCredits: w.totalCredits,
      totalRefunds: w.totalRefunds,
      totalCashback: w.totalCashback,
      totalReferralBonus: w.totalReferralBonus,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    };
  }

  private mapToTransactionResponseDto(t: WalletTransaction): WalletTransactionResponseDto {
    return {
      id: t.id,
      walletId: t.walletId,
      customerId: t.customerId,
      type: t.type,
      amount: t.amount,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      description: t.description,
      referenceId: t.referenceId,
      createdAt: t.createdAt,
    };
  }

  private mapToCouponResponseDto(c: Coupon): CouponResponseDto {
    return {
      id: c.id,
      code: c.code,
      providerId: c.providerId,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscount: c.maxDiscount,
      minOrderAmount: c.minOrderAmount,
      validFrom: c.validFrom,
      validUntil: c.validUntil,
      usageLimit: c.usageLimit,
      usageCount: c.usageCount,
      limitPerCustomer: c.limitPerCustomer,
      isActive: c.isActive,
      applicableMealTypes: c.applicableMealTypes,
      applicableCategories: c.applicableCategories,
      createdAt: c.createdAt,
    };
  }

  private mapToSettlementResponseDto(s: Settlement): SettlementResponseDto {
    return {
      id: s.id,
      providerId: s.providerId,
      startDate: s.startDate,
      endDate: s.endDate,
      totalRevenue: s.totalRevenue,
      commissionAmount: s.commissionAmount,
      gatewayCharges: s.gatewayCharges,
      refunds: s.refunds,
      netAmount: s.netAmount,
      status: s.status,
      paidAt: s.paidAt,
      bankDetails: s.bankDetails,
      createdAt: s.createdAt,
    };
  }
}
