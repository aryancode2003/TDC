import { CustomersService } from './customers.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let customerRepo: any;
  let addressRepo: any;
  let reviewRepo: any;
  let waitlistRepo: any;
  let providerRepo: any;
  let userRepo: any;

  const mockCustomerRepo = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockAddressRepo = {
    find: jest.fn(),
    findByUserId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockReviewRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findByProviderId: jest.fn(),
    findByCustomerId: jest.fn(),
    find: jest.fn(),
  };

  const mockWaitlistRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProviderRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepo = {
    findByIdWithRoles: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    emailExists: jest.fn(),
    phoneExists: jest.fn(),
  };

  beforeEach(() => {
    customerRepo = mockCustomerRepo;
    addressRepo = mockAddressRepo;
    reviewRepo = mockReviewRepo;
    waitlistRepo = mockWaitlistRepo;
    providerRepo = mockProviderRepo;
    userRepo = mockUserRepo;

    service = new CustomersService(
      customerRepo,
      addressRepo,
      reviewRepo,
      waitlistRepo,
      providerRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      userRepo,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateCustomerProfile', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepo.findByIdWithRoles.mockResolvedValue(null);
      await expect(service.getOrCreateCustomerProfile('user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user type is not customer', async () => {
      userRepo.findByIdWithRoles.mockResolvedValue({ userType: 'provider' });
      await expect(service.getOrCreateCustomerProfile('user-id')).rejects.toThrow(BadRequestException);
    });

    it('should return existing customer profile if it exists', async () => {
      userRepo.findByIdWithRoles.mockResolvedValue({ id: 'user-id', userType: 'customer' });
      const mockCustomer = { id: 'cust-id', userId: 'user-id' };
      customerRepo.findByUserId.mockResolvedValue(mockCustomer);

      const result = await service.getOrCreateCustomerProfile('user-id');
      expect(result).toEqual(mockCustomer);
    });

    it('should create and return new customer profile if it does not exist', async () => {
      userRepo.findByIdWithRoles.mockResolvedValue({ id: 'user-id', userType: 'customer' });
      customerRepo.findByUserId.mockResolvedValue(null);
      const mockCustomer = { id: 'new-cust-id', userId: 'user-id' };
      customerRepo.create.mockReturnValue(mockCustomer);
      customerRepo.save.mockResolvedValue(mockCustomer);

      const result = await service.getOrCreateCustomerProfile('user-id');
      expect(result).toEqual(mockCustomer);
      expect(customerRepo.create).toHaveBeenCalled();
    });
  });

  describe('createAddress', () => {
    it('should create and set address as default if it is the first address', async () => {
      addressRepo.find.mockResolvedValue([]);
      const mockAddr = { id: 'addr-id', isDefault: true };
      addressRepo.create.mockReturnValue(mockAddr);
      addressRepo.save.mockResolvedValue(mockAddr);

      const result = await service.createAddress('user-id', {
        type: 'home',
        street: 'Main St',
        locality: 'Central',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      });

      expect(result.isDefault).toBe(true);
    });

    it('should set other addresses as non-default if new address is default', async () => {
      addressRepo.find.mockResolvedValue([{ id: 'existing-addr' }]);
      const mockAddr = { id: 'new-addr-id', isDefault: true };
      addressRepo.create.mockReturnValue(mockAddr);
      addressRepo.save.mockResolvedValue(mockAddr);

      await service.createAddress('user-id', {
        type: 'office',
        street: 'Sub St',
        locality: 'South',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
      });

      expect(addressRepo.update).toHaveBeenCalledWith({ userId: 'user-id' }, { isDefault: false });
    });
  });

  describe('createReview', () => {
    it('should calculate overall rating and update provider and customer stats', async () => {
      const mockUser = { id: 'user-id', userType: 'customer' };
      const mockCustomer = { id: 'cust-id', userId: 'user-id' };
      userRepo.findByIdWithRoles.mockResolvedValue(mockUser);
      customerRepo.findByUserId.mockResolvedValue(mockCustomer);
      providerRepo.findOne.mockResolvedValue({ id: 'prov-id', verificationStatus: 'approved' });

      const mockReview = {
        id: 'rev-id',
        customerId: 'cust-id',
        providerId: 'prov-id',
        foodRating: 5,
        tasteRating: 4,
        packagingRating: 4,
        deliveryRating: 5,
        quantityRating: 4,
        overallRating: 4,
        title: 'Good',
        description: 'Nice food',
        photos: [],
        videos: [],
        isVerifiedPurchase: true,
        helpfulCount: 0,
        isVisible: true,
      };

      reviewRepo.create.mockReturnValue(mockReview);
      reviewRepo.save.mockResolvedValue(mockReview);
      reviewRepo.find.mockResolvedValue([mockReview]);

      const result = await service.createReview('user-id', {
        providerId: 'prov-id',
        foodRating: 5,
        tasteRating: 4,
        packagingRating: 4,
        deliveryRating: 5,
        quantityRating: 4,
        title: 'Good',
        description: 'Nice food',
      });

      expect(result.overallRating).toBe(4);
      expect(providerRepo.update).toHaveBeenCalledWith('prov-id', { avgRating: 4, totalReviews: 1 });
      expect(customerRepo.update).toHaveBeenCalledWith('cust-id', { avgRating: 4, totalReviews: 1 });
    });
  });

  describe('addToWaitlist', () => {
    it('should throw ConflictException if already on waitlist for pincode', async () => {
      waitlistRepo.findOne.mockResolvedValue({ id: 'existing-waitlist' });

      await expect(
        service.addToWaitlist({
          name: 'John',
          phone: '1234567890',
          email: 'john@example.com',
          pincode: '400001',
          city: 'Mumbai',
          state: 'Maharashtra',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should add to waitlist successfully', async () => {
      waitlistRepo.findOne.mockResolvedValue(null);
      const mockWaitlist = {
        id: 'wait-id',
        name: 'John',
        pincode: '400001',
        status: 'pending',
      };
      waitlistRepo.create.mockReturnValue(mockWaitlist);
      waitlistRepo.save.mockResolvedValue(mockWaitlist);

      const result = await service.addToWaitlist({
        name: 'John',
        phone: '1234567890',
        email: 'john@example.com',
        pincode: '400001',
        city: 'Mumbai',
        state: 'Maharashtra',
      });

      expect(result.id).toBe('wait-id');
      expect(result.status).toBe('pending');
    });
  });
});
