import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { In, Not } from 'typeorm';
import { CustomerRepository } from './repositories/customer.repository';
import { AddressRepository } from './repositories/address.repository';
import { ReviewRepository } from './repositories/review.repository';
import { WaitlistRepository } from './repositories/waitlist.repository';
import { ProviderRepository } from '../providers/repositories/provider.repository';
import {
  MealCategoryRepository,
  MealRepository,
  SubscriptionPlanRepository,
  SubscriptionPlanMealRepository,
} from '../providers/repositories/meal.repository';
import {
  ServiceAreaRepository,
  DeliverySlotRepository,
} from '../providers/repositories/location.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { Customer, Address, Review, Waitlist, Meal, SubscriptionPlan } from '../database/entities';
import { UpdateCustomerProfileDto, CustomerResponseDto } from './dto/customer.dto';
import { CreateAddressDto, UpdateAddressDto, AddressResponseDto } from './dto/address.dto';
import { SearchProvidersQueryDto } from './dto/discovery.dto';
import { CreateReviewDto, ReviewResponseDto } from './dto/review.dto';
import { CreateWaitlistDto, WaitlistResponseDto } from './dto/waitlist.dto';

@Injectable()
export class CustomersService {
  constructor(
    private customerRepository: CustomerRepository,
    private addressRepository: AddressRepository,
    private reviewRepository: ReviewRepository,
    private waitlistRepository: WaitlistRepository,
    private providerRepository: ProviderRepository,
    private mealCategoryRepository: MealCategoryRepository,
    private mealRepository: MealRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository,
    private subscriptionPlanMealRepository: SubscriptionPlanMealRepository,
    private serviceAreaRepository: ServiceAreaRepository,
    private deliverySlotRepository: DeliverySlotRepository,
    private userRepository: UserRepository,
  ) {}

  /**
   * Helper: Find customer by User ID, create one if user type is 'customer' but no profile exists
   */
  async getOrCreateCustomerProfile(userId: string): Promise<Customer> {
    const user = await this.userRepository.findByIdWithRoles(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (user.userType !== 'customer') {
      throw new BadRequestException('User is not registered as a customer.');
    }

    let customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      customer = this.customerRepository.create({
        userId,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalSpent: 0,
        avgRating: 0,
        totalReviews: 0,
        preferences: {},
      });
      customer = await this.customerRepository.save(customer);
    }
    return customer;
  }

  /**
   * Get customer profile combined with user details
   */
  async getCustomerProfile(userId: string): Promise<CustomerResponseDto> {
    const customer = await this.getOrCreateCustomerProfile(userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    return this.mapToCustomerResponseDto(customer, user);
  }

  /**
   * Update customer profile and preferences
   */
  async updateCustomerProfile(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerResponseDto> {
    const customer = await this.getOrCreateCustomerProfile(userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Validate and update User-level fields if provided
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.avatar !== undefined) user.avatar = dto.avatar;

    if (dto.email !== undefined && dto.email !== user.email) {
      const emailExists = await this.userRepository.emailExists(dto.email, userId);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    if (dto.phone !== undefined && dto.phone !== user.phone) {
      const phoneExists = await this.userRepository.phoneExists(dto.phone, userId);
      if (phoneExists) {
        throw new ConflictException('Phone number already in use');
      }
      user.phone = dto.phone;
    }

    await this.userRepository.save(user);

    // Update Customer-level fields
    if (dto.preferredProviderId !== undefined) {
      if (dto.preferredProviderId) {
        const providerExists = await this.providerRepository.findOne({ where: { id: dto.preferredProviderId } });
        if (!providerExists) {
          throw new NotFoundException(`Provider with ID ${dto.preferredProviderId} not found.`);
        }
      }
      customer.preferredProviderId = dto.preferredProviderId || undefined;
    }

    if (dto.preferences !== undefined) {
      customer.preferences = {
        ...customer.preferences,
        ...dto.preferences,
      };
    }

    const savedCustomer = await this.customerRepository.save(customer);
    return this.mapToCustomerResponseDto(savedCustomer, user);
  }

  // ==========================================
  // ADDRESS MANAGEMENT
  // ==========================================

  async createAddress(userId: string, dto: CreateAddressDto): Promise<AddressResponseDto> {
    // Check if this is the first address, if so, force default
    const existing = await this.addressRepository.find({ where: { userId } });
    const isDefault = existing.length === 0 ? true : !!dto.isDefault;

    if (isDefault) {
      // Unset default from other addresses
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    const address = this.addressRepository.create({
      userId,
      type: dto.type,
      street: dto.street,
      locality: dto.locality,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      isDefault,
    });

    const saved = await this.addressRepository.save(address);
    return this.mapToAddressResponseDto(saved);
  }

  async listAddresses(userId: string): Promise<AddressResponseDto[]> {
    const list = await this.addressRepository.findByUserId(userId);
    return list.map(addr => this.mapToAddressResponseDto(addr));
  }

  async getAddress(userId: string, id: string): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found.`);
    }
    return this.mapToAddressResponseDto(address);
  }

  async updateAddress(userId: string, id: string, dto: UpdateAddressDto): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found.`);
    }

    if (dto.isDefault === true) {
      // Unset default from other addresses
      await this.addressRepository.update({ userId, id: Not(id) }, { isDefault: false });
      address.isDefault = true;
    } else if (dto.isDefault === false) {
      // Make sure we have at least one default address if possible
      address.isDefault = false;
    }

    if (dto.type !== undefined) address.type = dto.type;
    if (dto.street !== undefined) address.street = dto.street;
    if (dto.locality !== undefined) address.locality = dto.locality;
    if (dto.city !== undefined) address.city = dto.city;
    if (dto.state !== undefined) address.state = dto.state;
    if (dto.pincode !== undefined) address.pincode = dto.pincode;
    if (dto.latitude !== undefined) address.latitude = dto.latitude;
    if (dto.longitude !== undefined) address.longitude = dto.longitude;

    const saved = await this.addressRepository.save(address);
    return this.mapToAddressResponseDto(saved);
  }

  async deleteAddress(userId: string, id: string): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found.`);
    }

    await this.addressRepository.softRemove(address);

    // If deleted address was default, set another one as default
    if (address.isDefault) {
      const remaining = await this.addressRepository.findOne({ where: { userId } });
      if (remaining) {
        remaining.isDefault = true;
        await this.addressRepository.save(remaining);
      }
    }
  }

  // ==========================================
  // PROVIDER DISCOVERY & DETAILS
  // ==========================================

  async searchProviders(query: SearchProvidersQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.providerRepository.createQueryBuilder('provider');
    qb.where('provider.verificationStatus = :status', { status: 'approved' });
    qb.andWhere('provider.isActive = :isActive', { isActive: true });

    // Filter by location (Service Areas)
    if (query.pincode || query.city || query.locality) {
      // Use subquery or join
      qb.innerJoin(
        'service_areas',
        'sa',
        'sa.providerId = provider.id AND sa.isActive = :saActive',
        { saActive: true }
      );

      if (query.pincode) {
        qb.andWhere('sa.pincode = :pincode', { pincode: query.pincode });
      }
      if (query.city) {
        qb.andWhere('sa.city ILIKE :city', { city: `%${query.city}%` });
      }
      if (query.locality) {
        qb.andWhere('sa.locality ILIKE :locality', { locality: `%${query.locality}%` });
      }
    }

    // Filter by name or description
    if (query.search) {
      qb.andWhere(
        '(provider.businessName ILIKE :search OR provider.description ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Filter by minimum rating
    if (query.minRating !== undefined) {
      qb.andWhere('provider.avgRating >= :minRating', { minRating: query.minRating });
    }

    // Filter by dietary type (veg, non-veg, jain) offered
    if (query.dietaryType) {
      qb.andWhere((subQuery) => {
        const sub = subQuery
          .subQuery()
          .select('1')
          .from('meals', 'm')
          .where('m.providerId = provider.id')
          .andWhere('m.type = :dietaryType', { dietaryType: query.dietaryType })
          .andWhere('m.isAvailable = :mealAvailable', { mealAvailable: true })
          .andWhere('m.deletedAt IS NULL');
        return `EXISTS ${sub.getQuery()}`;
      });
    }

    qb.orderBy('provider.avgRating', 'DESC');
    qb.addOrderBy('provider.createdAt', 'DESC');
    qb.skip(skip);
    qb.take(limit);

    const [providers, total] = await qb.getManyAndCount();

    return {
      data: providers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProviderDetails(providerId: string) {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId, verificationStatus: 'approved', isActive: true },
    });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${providerId} not found.`);
    }

    const slots = await this.deliverySlotRepository.find({
      where: { providerId, isActive: true },
    });

    const areas = await this.serviceAreaRepository.find({
      where: { providerId, isActive: true },
    });

    return {
      provider,
      slots,
      areas,
    };
  }

  async getProviderMenu(providerId: string) {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId, verificationStatus: 'approved', isActive: true },
    });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${providerId} not found.`);
    }

    const categories = await this.mealCategoryRepository.find({
      where: { providerId, isActive: true },
      order: { displayOrder: 'ASC' },
    });

    const meals = await this.mealRepository.find({
      where: { providerId, isAvailable: true },
      order: { displayOrder: 'ASC' },
    });

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      displayOrder: cat.displayOrder,
      isSystemDefault: cat.isSystemDefault,
      meals: meals.filter(meal => meal.categoryId === cat.id),
    }));
  }

  async getProviderPlans(providerId: string): Promise<SubscriptionPlan[]> {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId, verificationStatus: 'approved', isActive: true },
    });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${providerId} not found.`);
    }

    return this.subscriptionPlanRepository.find({
      where: { providerId, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async getPlanDetails(planId: string) {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: planId, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${planId} not found.`);
    }

    const planMeals = await this.subscriptionPlanMealRepository.find({
      where: { planId },
    });

    const mealIds = planMeals.map(pm => pm.mealId);
    let meals: Meal[] = [];
    if (mealIds.length > 0) {
      meals = await this.mealRepository.find({
        where: { id: In(mealIds) },
      });
    }

    const schedule = planMeals.map(pm => {
      const meal = meals.find(m => m.id === pm.mealId);
      return {
        id: pm.id,
        day: pm.day,
        quantity: pm.quantity,
        meal,
      };
    });

    return {
      plan,
      schedule,
    };
  }

  // ==========================================
  // REVIEWS & RATINGS SYSTEM
  // ==========================================

  async createReview(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const customer = await this.getOrCreateCustomerProfile(userId);

    // Verify provider exists
    const provider = await this.providerRepository.findOne({
      where: { id: dto.providerId, verificationStatus: 'approved' },
    });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${dto.providerId} not found.`);
    }

    // Overall rating is the average of five rating categories
    const overallRating = Math.round(
      (dto.foodRating + dto.tasteRating + dto.packagingRating + dto.deliveryRating + dto.quantityRating) / 5
    );

    const review = this.reviewRepository.create({
      customerId: customer.id,
      providerId: dto.providerId,
      orderId: dto.orderId,
      subscriptionId: dto.subscriptionId,
      foodRating: dto.foodRating,
      tasteRating: dto.tasteRating,
      packagingRating: dto.packagingRating,
      deliveryRating: dto.deliveryRating,
      quantityRating: dto.quantityRating,
      overallRating,
      title: dto.title,
      description: dto.description,
      photos: dto.photos || [],
      videos: dto.videos || [],
      isVerifiedPurchase: true,
      helpfulCount: 0,
      isVisible: true,
    });

    const saved = await this.reviewRepository.save(review);

    // Recalculate stats
    await this.recalculateProviderRating(dto.providerId);
    await this.recalculateCustomerRating(customer.id);

    return this.mapToReviewResponseDto(saved);
  }

  async getProviderReviews(providerId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.findByProviderId(providerId);
    return reviews.map(r => this.mapToReviewResponseDto(r));
  }

  async getCustomerReviews(userId: string): Promise<ReviewResponseDto[]> {
    const customer = await this.getOrCreateCustomerProfile(userId);
    const reviews = await this.reviewRepository.findByCustomerId(customer.id);
    return reviews.map(r => this.mapToReviewResponseDto(r));
  }

  private async recalculateProviderRating(providerId: string) {
    const reviews = await this.reviewRepository.find({
      where: { providerId, isVisible: true },
    });

    const count = reviews.length;
    const avg = count > 0 
      ? parseFloat((reviews.reduce((sum, r) => sum + r.overallRating, 0) / count).toFixed(2))
      : 0;

    await this.providerRepository.update(providerId, {
      avgRating: avg,
      totalReviews: count,
    });
  }

  private async recalculateCustomerRating(customerId: string) {
    const reviews = await this.reviewRepository.find({
      where: { customerId, isVisible: true },
    });

    const count = reviews.length;
    const avg = count > 0 
      ? parseFloat((reviews.reduce((sum, r) => sum + r.overallRating, 0) / count).toFixed(2))
      : 0;

    await this.customerRepository.update(customerId, {
      avgRating: avg,
      totalReviews: count,
    });
  }

  // ==========================================
  // WAITLIST MANAGEMENT
  // ==========================================

  async addToWaitlist(dto: CreateWaitlistDto): Promise<WaitlistResponseDto> {
    // Check if phone or email already in waitlist
    const existing = await this.waitlistRepository.findOne({
      where: [
        { phone: dto.phone, pincode: dto.pincode },
        { email: dto.email, pincode: dto.pincode },
      ],
    });

    if (existing) {
      throw new ConflictException('You have already joined the waitlist for this pincode.');
    }

    const waitlist = this.waitlistRepository.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      pincode: dto.pincode,
      city: dto.city,
      state: dto.state,
      preferredMealType: dto.preferredMealType || 'all',
      status: 'pending',
    });

    const saved = await this.waitlistRepository.save(waitlist);
    return this.mapToWaitlistResponseDto(saved);
  }

  // ==========================================
  // MAPPER FUNCTIONS
  // ==========================================

  private mapToCustomerResponseDto(customer: Customer, user: any): CustomerResponseDto {
    return {
      id: customer.id,
      userId: customer.userId,
      user: user ? {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      } : undefined,
      totalSubscriptions: customer.totalSubscriptions,
      activeSubscriptions: customer.activeSubscriptions,
      totalSpent: customer.totalSpent,
      avgRating: customer.avgRating,
      totalReviews: customer.totalReviews,
      preferredProviderId: customer.preferredProviderId,
      preferences: customer.preferences,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  private mapToAddressResponseDto(addr: Address): AddressResponseDto {
    return {
      id: addr.id,
      userId: addr.userId,
      type: addr.type,
      street: addr.street,
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      latitude: addr.latitude ? parseFloat(addr.latitude.toString()) : undefined,
      longitude: addr.longitude ? parseFloat(addr.longitude.toString()) : undefined,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt,
    };
  }

  private mapToReviewResponseDto(rev: Review): ReviewResponseDto {
    return {
      id: rev.id,
      customerId: rev.customerId,
      providerId: rev.providerId,
      orderId: rev.orderId,
      subscriptionId: rev.subscriptionId,
      foodRating: rev.foodRating,
      tasteRating: rev.tasteRating,
      packagingRating: rev.packagingRating,
      deliveryRating: rev.deliveryRating,
      quantityRating: rev.quantityRating,
      overallRating: rev.overallRating,
      title: rev.title,
      description: rev.description,
      photos: rev.photos,
      videos: rev.videos,
      isVerifiedPurchase: rev.isVerifiedPurchase,
      helpfulCount: rev.helpfulCount,
      isVisible: rev.isVisible,
      createdAt: rev.createdAt,
    };
  }

  private mapToWaitlistResponseDto(wait: Waitlist): WaitlistResponseDto {
    return {
      id: wait.id,
      name: wait.name,
      phone: wait.phone,
      email: wait.email,
      pincode: wait.pincode,
      city: wait.city,
      state: wait.state,
      preferredMealType: wait.preferredMealType,
      status: wait.status,
      createdAt: wait.createdAt,
    };
  }
}
