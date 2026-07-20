import { AiService } from './ai.service';
import { NotFoundException } from '@nestjs/common';

describe('AiService', () => {
  let service: AiService;
  let dataSource: any;

  const mockProvider = {
    id: 'prov-1',
    businessName: 'Annapurna Kitchen',
    avgRating: 4.8,
  };

  const mockCustomer = {
    id: 'cust-1',
    userId: 'user-1',
    preferences: JSON.stringify({ dietaryChoice: 'veg' }),
  };

  const mockAddress = {
    id: 'addr-1',
    userId: 'user-1',
    pincode: '400001',
    isDefault: true,
  };

  const mockServiceArea = {
    id: 'sa-1',
    providerId: 'prov-1',
    pincode: '400001',
    isActive: true,
  };

  const mockMeal = {
    id: 'meal-1',
    providerId: 'prov-1',
    name: 'Standard Veg Thali',
    price: 120,
    calorieCount: 520,
    type: 'veg',
    specialization: 'healthy',
    isAvailable: true,
  };

  const mockDataSource = {
    manager: {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    },
  };

  beforeEach(() => {
    dataSource = mockDataSource;
    service = new AiService(dataSource as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProviderDemandForecast', () => {
    it('should throw NotFoundException if provider does not exist', async () => {
      dataSource.manager.findOne.mockResolvedValue(null);

      await expect(
        service.getProviderDemandForecast('invalid-prov-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate demand forecast successfully', async () => {
      dataSource.manager.findOne.mockResolvedValue(mockProvider);
      
      // Order QueryBuilder Mock
      const mockOrderQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            orderDate: new Date(),
            mealType: 'lunch',
            items: JSON.stringify([{ quantity: 2 }]),
          },
        ]),
      };
      
      // Waitlist QueryBuilder Mock
      const mockWaitlistQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(15),
      };

      dataSource.manager.createQueryBuilder
        .mockReturnValueOnce(mockOrderQB)
        .mockReturnValueOnce(mockWaitlistQB);

      dataSource.manager.find
        .mockResolvedValueOnce([
          { id: 'sub-1', mealType: 'lunch', status: 'active' },
          { id: 'sub-2', mealType: 'lunch', status: 'active' },
        ]) // subscriptions
        .mockResolvedValueOnce([mockServiceArea]); // service areas

      const result = await service.getProviderDemandForecast('prov-1', 5);

      expect(result.providerId).toBe('prov-1');
      expect(result.businessName).toBe('Annapurna Kitchen');
      expect(result.timeframeDays).toBe(5);
      expect(result.forecast.length).toBe(5);
      expect(result.forecast[0].meals.lunch).toBeGreaterThan(0);
      expect(result.insights.length).toBeGreaterThan(0);
    });
  });

  describe('getChurnRiskAnalysis', () => {
    it('should analyze customer churn risks successfully', async () => {
      dataSource.manager.find
        .mockResolvedValueOnce([mockCustomer]) // customers
        .mockResolvedValueOnce([
          { id: 'rev-1', customerId: 'cust-1', overallRating: 2 }, // reviews
        ])
        .mockResolvedValueOnce([
          { id: 'sub-1', customerId: 'cust-1', status: 'active', endDate: new Date(), autoRenew: false }, // subscriptions
        ]);

      const mockUserQB = {
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          firstName: 'Aryan',
          lastName: 'Patel',
          phone: '+919876543210',
        }),
      };
      dataSource.manager.createQueryBuilder.mockReturnValue(mockUserQB);

      const result = await service.getChurnRiskAnalysis();

      expect(result.totalCustomersAnalyzed).toBe(1);
      expect(result.highRiskCustomers.length).toBe(1);
      expect(result.highRiskCustomers[0].customerId).toBe('cust-1');
      expect(result.highRiskCustomers[0].riskScore).toBeGreaterThan(50);
      expect(result.highRiskCustomers[0].riskFactors).toContain(
        'Subscription ends in 0 days with Auto-Renew disabled',
      );
    });
  });

  describe('getCustomerRecommendations', () => {
    it('should throw NotFoundException if customer does not exist', async () => {
      dataSource.manager.findOne.mockResolvedValue(null);

      await expect(
        service.getCustomerRecommendations('invalid-cust-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return personalized recommendations for a customer', async () => {
      dataSource.manager.findOne
        .mockResolvedValueOnce(mockCustomer) // customer
        .mockResolvedValueOnce(mockAddress); // address

      dataSource.manager.find.mockResolvedValueOnce([mockServiceArea]); // service areas

      const mockProviderQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProvider]),
      };
      const mockMealQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMeal]),
      };

      dataSource.manager.createQueryBuilder
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({
            firstName: 'Aryan',
            lastName: 'Patel',
          }),
        })
        .mockReturnValueOnce(mockProviderQB)
        .mockReturnValueOnce(mockMealQB);

      const result = await service.getCustomerRecommendations('cust-1');

      expect(result.customerId).toBe('cust-1');
      expect(result.pincode).toBe('400001');
      expect(result.recommendations.length).toBe(1);
      expect(result.recommendations[0].mealName).toBe('Standard Veg Thali');
      expect(result.recommendations[0].matchScore).toBeGreaterThan(70);
    });
  });
});
