import { AdminService } from './admin.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let providerRepo: any;
  let customerRepo: any;
  let systemSettingRepo: any;
  let waitlistRepo: any;
  let notificationsService: any;
  let dataSource: any;

  const mockProviderRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockCustomerRepo = {
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSystemSettingRepo = {
    findByKey: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockWaitlistRepo = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotification: jest.fn(),
  };

  const mockDataSource = {
    manager: {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    },
  };

  beforeEach(() => {
    providerRepo = mockProviderRepo;
    customerRepo = mockCustomerRepo;
    systemSettingRepo = mockSystemSettingRepo;
    waitlistRepo = mockWaitlistRepo;
    notificationsService = mockNotificationsService;
    dataSource = mockDataSource;

    // Default mock setup for query builder inside analytics
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ gmv: 1000, revenue: 150 }),
    };
    dataSource.manager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const mockCustomerQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(5),
    };
    customerRepo.createQueryBuilder.mockReturnValue(mockCustomerQueryBuilder);

    service = new AdminService(
      providerRepo,
      customerRepo,
      systemSettingRepo,
      waitlistRepo,
      notificationsService,
      dataSource as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProviderVerificationStatus', () => {
    it('should throw NotFoundException if provider not found', async () => {
      providerRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateProviderVerificationStatus('prov-id', { verificationStatus: 'approved' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should approve provider and trigger status notification', async () => {
      const mockProvider = {
        id: 'prov-id',
        userId: 'user-123',
        verificationStatus: 'pending',
      };
      providerRepo.findOne.mockResolvedValue(mockProvider);
      providerRepo.save.mockImplementation(async (p: any) => p);

      const result = await service.updateProviderVerificationStatus('prov-id', {
        verificationStatus: 'approved',
        commissionRate: 12,
      });

      expect(result.verificationStatus).toBe('approved');
      expect(result.commissionRate).toBe(12);
      expect(providerRepo.save).toHaveBeenCalled();
      expect(notificationsService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-123', type: 'alert' }),
      );
    });
  });

  describe('getGlobalAnalytics', () => {
    it('should aggregate metrics successfully', async () => {
      providerRepo.count.mockResolvedValue(3);
      dataSource.manager.count.mockResolvedValue(2);
      dataSource.manager.connection = { options: { type: 'postgres' } };

      const result = await service.getGlobalAnalytics();

      expect(result.totalGMV).toBe(1000);
      expect(result.totalRevenue).toBe(150);
      expect(result.activeProviders).toBe(3);
      expect(result.activeCustomers).toBe(5);
    });
  });

  describe('updateSystemSetting', () => {
    it('should create system setting if not exists', async () => {
      systemSettingRepo.findByKey.mockResolvedValue(null);
      const mockSetting = { key: 'tax', value: 5 };
      systemSettingRepo.create.mockReturnValue(mockSetting);
      systemSettingRepo.save.mockResolvedValue(mockSetting);

      const result = await service.updateSystemSetting('tax', 5);

      expect(result.value).toBe(5);
      expect(systemSettingRepo.create).toHaveBeenCalled();
    });

    it('should update system setting if already exists', async () => {
      const mockSetting = { key: 'tax', value: 5 };
      systemSettingRepo.findByKey.mockResolvedValue(mockSetting);
      systemSettingRepo.save.mockResolvedValue({ ...mockSetting, value: 8 });

      const result = await service.updateSystemSetting('tax', 8);

      expect(result.value).toBe(8);
      expect(systemSettingRepo.save).toHaveBeenCalled();
    });
  });

  describe('convertWaitlist', () => {
    it('should notify waitlisted users and change status to notified', async () => {
      const mockWaitlist = [
        { id: 'w-1', name: 'John', phone: '12345', pincode: '400001', status: 'pending' },
      ];
      waitlistRepo.find.mockResolvedValue(mockWaitlist);

      const mockUserQB = {
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ id: 'user-999' }),
      };
      dataSource.manager.createQueryBuilder.mockReturnValueOnce(mockUserQB);

      const result = await service.convertWaitlist('400001');

      expect(result.notifiedCount).toBe(1);
      expect(mockWaitlist[0].status).toBe('notified');
      expect(waitlistRepo.save).toHaveBeenCalledWith(mockWaitlist);
      expect(notificationsService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-999', type: 'promo' }),
      );
    });
  });
});
