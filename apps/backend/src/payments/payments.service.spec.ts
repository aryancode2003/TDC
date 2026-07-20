import { PaymentsService } from './payments.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: any;
  let walletRepo: any;
  let walletTransactionRepo: any;
  let couponRepo: any;
  let settlementRepo: any;
  let customerRepo: any;
  let providerRepo: any;
  let userRepo: any;

  const mockPaymentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findByRazorpayOrderId: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockWalletRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findByCustomerId: jest.fn(),
  };

  const mockWalletTransactionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findByCustomerId: jest.fn(),
  };

  const mockCouponRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findProviderCoupons: jest.fn(),
    findActiveCoupons: jest.fn(),
  };

  const mockSettlementRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findByProviderId: jest.fn(),
  };

  const mockCustomerRepo = {
    findByUserId: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockProviderRepo = {
    findOne: jest.fn(),
  };

  const mockUserRepo = {};

  beforeEach(() => {
    paymentRepo = mockPaymentRepo;
    walletRepo = mockWalletRepo;
    walletTransactionRepo = mockWalletTransactionRepo;
    couponRepo = mockCouponRepo;
    settlementRepo = mockSettlementRepo;
    customerRepo = mockCustomerRepo;
    providerRepo = mockProviderRepo;
    userRepo = mockUserRepo;

    service = new PaymentsService(
      paymentRepo,
      walletRepo,
      walletTransactionRepo,
      couponRepo,
      settlementRepo,
      customerRepo,
      providerRepo,
      userRepo as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should throw NotFoundException if customer profile not found', async () => {
      customerRepo.findByUserId.mockResolvedValue(null);
      await expect(service.initiatePayment('user-id', { providerId: 'prov-id', amount: 100 })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if provider profile not found', async () => {
      customerRepo.findByUserId.mockResolvedValue({ id: 'cust-id' });
      providerRepo.findOne.mockResolvedValue(null);
      await expect(service.initiatePayment('user-id', { providerId: 'prov-id', amount: 100 })).rejects.toThrow(NotFoundException);
    });

    it('should generate a pending payment order successfully', async () => {
      customerRepo.findByUserId.mockResolvedValue({ id: 'cust-id' });
      providerRepo.findOne.mockResolvedValue({ id: 'prov-id', commissionRate: 15 });

      const mockPayment = {
        id: 'pay-id',
        razorpayOrderId: 'order_mock_123',
        status: 'pending',
        amount: 100,
      };

      paymentRepo.create.mockReturnValue(mockPayment);
      paymentRepo.save.mockResolvedValue(mockPayment);

      const result = await service.initiatePayment('user-id', { providerId: 'prov-id', amount: 100 });
      expect(result.status).toBe('pending');
      expect(result.amount).toBe(100);
      expect(paymentRepo.create).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should verify signature and mark payment as completed', async () => {
      const mockPayment = {
        id: 'pay-id',
        status: 'pending',
        amount: 100,
        customerId: 'cust-id',
      };
      paymentRepo.findByRazorpayOrderId.mockResolvedValue(mockPayment);
      paymentRepo.save.mockResolvedValue({ ...mockPayment, status: 'completed' });

      const result = await service.verifyPayment('user-id', {
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: 'sig_123',
      });

      expect(result.status).toBe('completed');
    });
  });

  describe('loadWallet', () => {
    it('should credit wallet and create a transaction history entry', async () => {
      customerRepo.findByUserId.mockResolvedValue({ id: 'cust-id' });
      const mockWallet = { id: 'wallet-id', customerId: 'cust-id', balance: 50, totalCredits: 50 };
      walletRepo.findByCustomerId.mockResolvedValue(mockWallet);
      walletRepo.save.mockResolvedValue({ ...mockWallet, balance: 150 });

      const result = await service.loadWallet('user-id', { amount: 100 });
      expect(result.balance).toBe(150);
      expect(walletTransactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'credit', amount: 100 }),
      );
    });
  });

  describe('validateAndApplyCoupon', () => {
    it('should calculate discount for percentage coupon successfully', async () => {
      const mockCoupon = {
        code: 'SAVE10',
        isActive: true,
        validFrom: new Date(Date.now() - 3600000), // 1 hour ago
        validUntil: new Date(Date.now() + 3600000), // 1 hour later
        usageLimit: 0,
        usageCount: 0,
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 50,
        minOrderAmount: 100,
      };

      couponRepo.findOne.mockResolvedValue(mockCoupon);

      const result = await service.validateAndApplyCoupon('user-id', {
        code: 'SAVE10',
        amount: 200,
      });

      expect(result.discountAmount).toBe(20);
      expect(result.finalAmount).toBe(180);
    });

    it('should throw BadRequestException if order amount is less than minOrderAmount', async () => {
      const mockCoupon = {
        code: 'SAVE10',
        isActive: true,
        validFrom: new Date(Date.now() - 3600000),
        validUntil: new Date(Date.now() + 3600000),
        minOrderAmount: 100,
      };

      couponRepo.findOne.mockResolvedValue(mockCoupon);

      await expect(
        service.validateAndApplyCoupon('user-id', {
          code: 'SAVE10',
          amount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processSettlement', () => {
    it('should create processed payout settlement successfully', async () => {
      providerRepo.findOne.mockResolvedValue({ id: 'prov-id', businessName: 'Test Kitchen', bankDetails: {} });
      settlementRepo.findOne.mockResolvedValue(null);

      const mockPayments = [
        { amount: 100, platformCommission: 15, gatewayCharges: 2, providerAmount: 83 },
        { amount: 200, platformCommission: 30, gatewayCharges: 4, providerAmount: 166 },
      ];
      paymentRepo.find.mockResolvedValue(mockPayments);

      const mockSettlement = {
        id: 'set-id',
        providerId: 'prov-id',
        totalRevenue: 300,
        commissionAmount: 45,
        gatewayCharges: 6,
        netAmount: 249,
        status: 'processed',
      };
      settlementRepo.create.mockReturnValue(mockSettlement);
      settlementRepo.save.mockResolvedValue(mockSettlement);

      const result = await service.processSettlement({
        providerId: 'prov-id',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
      });

      expect(result.totalRevenue).toBe(300);
      expect(result.netAmount).toBe(249);
      expect(settlementRepo.save).toHaveBeenCalled();
    });
  });
});
