import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProviderRepository } from './repositories/provider.repository';
import {
  MealCategoryRepository,
  MealRepository,
  SubscriptionPlanRepository,
  SubscriptionPlanMealRepository,
} from './repositories/meal.repository';
import {
  ServiceAreaRepository,
  DeliverySlotRepository,
  KitchenCapacityRepository,
} from './repositories/location.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { Provider, MealCategory, Meal, SubscriptionPlan, SubscriptionPlanMeal, ServiceArea, DeliverySlot, KitchenCapacity, Role } from '../database/entities';
import { RegisterProviderDto, UpdateProviderProfileDto } from './dto/provider.dto';
import { CreateMealCategoryDto, UpdateMealCategoryDto, CreateMealDto, UpdateMealDto, CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto, ConfigurePlanMealsDto } from './dto/menu.dto';
import { CreateServiceAreaDto, CreateDeliverySlotDto, UpdateDeliverySlotDto, SetKitchenCapacityDto } from './dto/provider-location.dto';
import { Between } from 'typeorm';

@Injectable()
export class ProvidersService {
  constructor(
    private providerRepository: ProviderRepository,
    private mealCategoryRepository: MealCategoryRepository,
    private mealRepository: MealRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository,
    private subscriptionPlanMealRepository: SubscriptionPlanMealRepository,
    private serviceAreaRepository: ServiceAreaRepository,
    private deliverySlotRepository: DeliverySlotRepository,
    private kitchenCapacityRepository: KitchenCapacityRepository,
    private userRepository: UserRepository,
  ) {}

  /**
   * Helper to find provider and throw if not found
   */
  private async findProviderOrThrow(userId: string): Promise<Provider> {
    const provider = await this.providerRepository.findByUserId(userId);
    if (!provider) {
      throw new NotFoundException('Provider profile not found. Please onboard first.');
    }
    return provider;
  }

  /**
   * Onboard / Register user as a Provider
   */
  async registerProvider(userId: string, registerDto: RegisterProviderDto): Promise<Provider> {
    const existing = await this.providerRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Provider profile already exists for this user.');
    }

    // Create provider business entity
    const provider = this.providerRepository.create({
      userId,
      businessName: registerDto.businessName,
      gstNumber: registerDto.gstNumber,
      panNumber: registerDto.panNumber,
      fssaiNumber: registerDto.fssaiNumber,
      description: registerDto.description,
      bankDetails: registerDto.bankDetails || {},
      verificationDocuments: registerDto.verificationDocuments || {},
      verificationStatus: 'pending',
      isActive: true,
    });

    const savedProvider = await this.providerRepository.save(provider);

    // Get the Partner role
    const partnerRole = await this.userRepository.manager.findOne(Role, {
      where: { type: 'partner' },
    });

    // Update user properties to match onboarding
    const userUpdate: any = { userType: 'provider' };
    if (partnerRole) {
      userUpdate.roleId = partnerRole.id;
    }
    await this.userRepository.update(userId, userUpdate);

    return savedProvider;
  }

  /**
   * Get provider profile
   */
  async getProviderProfile(userId: string): Promise<Provider> {
    return this.findProviderOrThrow(userId);
  }

  /**
   * Update provider profile
   */
  async updateProviderProfile(userId: string, updateDto: UpdateProviderProfileDto): Promise<Provider> {
    const provider = await this.findProviderOrThrow(userId);

    if (updateDto.businessName !== undefined) provider.businessName = updateDto.businessName;
    if (updateDto.description !== undefined) provider.description = updateDto.description;
    if (updateDto.businessLogo !== undefined) provider.businessLogo = updateDto.businessLogo;
    if (updateDto.businessBanner !== undefined) provider.businessBanner = updateDto.businessBanner;
    if (updateDto.bankDetails !== undefined) provider.bankDetails = updateDto.bankDetails;
    if (updateDto.metadata !== undefined) provider.metadata = updateDto.metadata;

    return this.providerRepository.save(provider);
  }

  // ==========================================
  // MENU CATEGORY MANAGEMENT
  // ==========================================

  async createMealCategory(userId: string, dto: CreateMealCategoryDto): Promise<MealCategory> {
    const provider = await this.findProviderOrThrow(userId);
    const category = this.mealCategoryRepository.create({
      providerId: provider.id,
      name: dto.name,
      description: dto.description,
      displayOrder: dto.displayOrder || 0,
      isActive: true,
      isSystemDefault: false,
    });
    return this.mealCategoryRepository.save(category);
  }

  async updateMealCategory(userId: string, id: string, dto: UpdateMealCategoryDto): Promise<MealCategory> {
    const provider = await this.findProviderOrThrow(userId);
    const category = await this.mealCategoryRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!category) {
      throw new NotFoundException(`Meal category with ID ${id} not found.`);
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.displayOrder !== undefined) category.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return this.mealCategoryRepository.save(category);
  }

  async deleteMealCategory(userId: string, id: string): Promise<void> {
    const provider = await this.findProviderOrThrow(userId);
    const category = await this.mealCategoryRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!category) {
      throw new NotFoundException(`Meal category with ID ${id} not found.`);
    }
    // Perform a soft-delete / deactivate
    category.isActive = false;
    await this.mealCategoryRepository.save(category);
    await this.mealCategoryRepository.softDelete(id);
  }

  async getMealCategories(userId: string): Promise<MealCategory[]> {
    const provider = await this.findProviderOrThrow(userId);
    return this.mealCategoryRepository.find({
      where: { providerId: provider.id },
      order: { displayOrder: 'ASC' },
    });
  }

  // ==========================================
  // MEAL MANAGEMENT
  // ==========================================

  async createMeal(userId: string, dto: CreateMealDto): Promise<Meal> {
    const provider = await this.findProviderOrThrow(userId);

    // Verify category belongs to provider
    const category = await this.mealCategoryRepository.findOne({
      where: { id: dto.categoryId, providerId: provider.id },
    });
    if (!category) {
      throw new BadRequestException(`Category with ID ${dto.categoryId} does not belong to this provider.`);
    }

    const meal = this.mealRepository.create({
      providerId: provider.id,
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      type: dto.type,
      specialization: dto.specialization || 'normal',
      calorieCount: dto.calorieCount || 0,
      preparationTime: dto.preparationTime || 0,
      servings: dto.servings || 0,
      displayOrder: dto.displayOrder || 0,
      isAvailable: true,
      imageUrl: dto.imageUrl,
      nutrients: dto.nutrients || {},
      allergens: dto.allergens || [],
      ingredients: dto.ingredients || [],
    });

    return this.mealRepository.save(meal);
  }

  async updateMeal(userId: string, id: string, dto: UpdateMealDto): Promise<Meal> {
    const provider = await this.findProviderOrThrow(userId);
    const meal = await this.mealRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found.`);
    }

    if (dto.categoryId !== undefined) {
      const category = await this.mealCategoryRepository.findOne({
        where: { id: dto.categoryId, providerId: provider.id },
      });
      if (!category) {
        throw new BadRequestException(`Category with ID ${dto.categoryId} does not belong to this provider.`);
      }
      meal.categoryId = dto.categoryId;
    }

    if (dto.name !== undefined) meal.name = dto.name;
    if (dto.description !== undefined) meal.description = dto.description;
    if (dto.price !== undefined) meal.price = dto.price;
    if (dto.type !== undefined) meal.type = dto.type;
    if (dto.specialization !== undefined) meal.specialization = dto.specialization;
    if (dto.calorieCount !== undefined) meal.calorieCount = dto.calorieCount;
    if (dto.preparationTime !== undefined) meal.preparationTime = dto.preparationTime;
    if (dto.servings !== undefined) meal.servings = dto.servings;
    if (dto.displayOrder !== undefined) meal.displayOrder = dto.displayOrder;
    if (dto.isAvailable !== undefined) meal.isAvailable = dto.isAvailable;
    if (dto.imageUrl !== undefined) meal.imageUrl = dto.imageUrl;
    if (dto.nutrients !== undefined) meal.nutrients = dto.nutrients;
    if (dto.allergens !== undefined) meal.allergens = dto.allergens;
    if (dto.ingredients !== undefined) meal.ingredients = dto.ingredients;

    return this.mealRepository.save(meal);
  }

  async deleteMeal(userId: string, id: string): Promise<void> {
    const provider = await this.findProviderOrThrow(userId);
    const meal = await this.mealRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found.`);
    }
    meal.isAvailable = false;
    await this.mealRepository.save(meal);
    await this.mealRepository.softDelete(id);
  }

  async getMeals(userId: string, categoryId?: string): Promise<Meal[]> {
    const provider = await this.findProviderOrThrow(userId);
    const where: any = { providerId: provider.id };
    if (categoryId) {
      where.categoryId = categoryId;
    }
    return this.mealRepository.find({
      where,
      order: { displayOrder: 'ASC' },
    });
  }

  // ==========================================
  // SUBSCRIPTION PLAN MANAGEMENT
  // ==========================================

  async createPlan(userId: string, dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const provider = await this.findProviderOrThrow(userId);
    const plan = this.subscriptionPlanRepository.create({
      providerId: provider.id,
      name: dto.name,
      description: dto.description,
      planType: dto.planType,
      durationDays: dto.durationDays,
      basePrice: dto.basePrice,
      discountPercentage: dto.discountPercentage || 0,
      deliveryCharges: dto.deliveryCharges || 0,
      packagingCharges: dto.packagingCharges || 0,
      depositAmount: dto.depositAmount || 0,
      taxPercentage: dto.taxPercentage || 0,
      totalMeals: 0,
      includedCategories: dto.includedCategories || {},
      isActive: true,
      displayOrder: 0,
    });
    return this.subscriptionPlanRepository.save(plan);
  }

  async updatePlan(userId: string, id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const provider = await this.findProviderOrThrow(userId);
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found.`);
    }

    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.planType !== undefined) plan.planType = dto.planType;
    if (dto.durationDays !== undefined) plan.durationDays = dto.durationDays;
    if (dto.basePrice !== undefined) plan.basePrice = dto.basePrice;
    if (dto.discountPercentage !== undefined) plan.discountPercentage = dto.discountPercentage;
    if (dto.deliveryCharges !== undefined) plan.deliveryCharges = dto.deliveryCharges;
    if (dto.packagingCharges !== undefined) plan.packagingCharges = dto.packagingCharges;
    if (dto.depositAmount !== undefined) plan.depositAmount = dto.depositAmount;
    if (dto.taxPercentage !== undefined) plan.taxPercentage = dto.taxPercentage;
    if (dto.includedCategories !== undefined) plan.includedCategories = dto.includedCategories;
    if (dto.isActive !== undefined) plan.isActive = dto.isActive;

    return this.subscriptionPlanRepository.save(plan);
  }

  async deletePlan(userId: string, id: string): Promise<void> {
    const provider = await this.findProviderOrThrow(userId);
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found.`);
    }
    plan.isActive = false;
    await this.subscriptionPlanRepository.save(plan);
    await this.subscriptionPlanRepository.softDelete(id);
  }

  async getPlans(userId: string): Promise<SubscriptionPlan[]> {
    const provider = await this.findProviderOrThrow(userId);
    return this.subscriptionPlanRepository.find({
      where: { providerId: provider.id },
      order: { displayOrder: 'ASC' },
    });
  }

  async configurePlanMeals(userId: string, planId: string, dto: ConfigurePlanMealsDto): Promise<SubscriptionPlanMeal[]> {
    const provider = await this.findProviderOrThrow(userId);
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: planId, providerId: provider.id },
    });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${planId} not found.`);
    }

    // Verify all meals belong to this provider
    const mealIds = dto.meals.map((m) => m.mealId);
    for (const mId of mealIds) {
      const meal = await this.mealRepository.findOne({
        where: { id: mId, providerId: provider.id },
      });
      if (!meal) {
        throw new BadRequestException(`Meal with ID ${mId} does not belong to this provider.`);
      }
    }

    // Delete existing meals configuration for this plan
    await this.subscriptionPlanMealRepository.delete({ planId });

    // Create new configurations
    const planMeals = dto.meals.map((m) =>
      this.subscriptionPlanMealRepository.create({
        planId,
        mealId: m.mealId,
        day: m.day,
        quantity: m.quantity,
      }),
    );

    const savedPlanMeals = await this.subscriptionPlanMealRepository.save(planMeals);

    // Calculate total meals in this plan configuration
    const totalMeals = dto.meals.reduce((sum, item) => sum + item.quantity, 0);
    plan.totalMeals = totalMeals;
    await this.subscriptionPlanRepository.save(plan);

    return savedPlanMeals;
  }

  // ==========================================
  // SERVICE AREA MANAGEMENT
  // ==========================================

  async addServiceArea(userId: string, dto: CreateServiceAreaDto): Promise<ServiceArea> {
    const provider = await this.findProviderOrThrow(userId);
    const area = this.serviceAreaRepository.create({
      providerId: provider.id,
      pincode: dto.pincode,
      locality: dto.locality,
      city: dto.city,
      state: dto.state,
      deliveryRadius: dto.deliveryRadius || 5,
      isActive: true,
    });
    return this.serviceAreaRepository.save(area);
  }

  async removeServiceArea(userId: string, id: string): Promise<void> {
    const provider = await this.findProviderOrThrow(userId);
    const area = await this.serviceAreaRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!area) {
      throw new NotFoundException(`Service area with ID ${id} not found.`);
    }
    await this.serviceAreaRepository.remove(area);
  }

  async getServiceAreas(userId: string): Promise<ServiceArea[]> {
    const provider = await this.findProviderOrThrow(userId);
    return this.serviceAreaRepository.find({
      where: { providerId: provider.id },
    });
  }

  // ==========================================
  // DELIVERY SLOT MANAGEMENT
  // ==========================================

  async addDeliverySlot(userId: string, dto: CreateDeliverySlotDto): Promise<DeliverySlot> {
    const provider = await this.findProviderOrThrow(userId);
    const slot = this.deliverySlotRepository.create({
      providerId: provider.id,
      mealType: dto.mealType,
      startTime: dto.startTime,
      endTime: dto.endTime,
      maxCapacity: dto.maxCapacity,
      currentBookings: 0,
      serviceDays: dto.serviceDays,
      isActive: true,
    });
    return this.deliverySlotRepository.save(slot);
  }

  async updateDeliverySlot(userId: string, id: string, dto: UpdateDeliverySlotDto): Promise<DeliverySlot> {
    const provider = await this.findProviderOrThrow(userId);
    const slot = await this.deliverySlotRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!slot) {
      throw new NotFoundException(`Delivery slot with ID ${id} not found.`);
    }

    if (dto.startTime !== undefined) slot.startTime = dto.startTime;
    if (dto.endTime !== undefined) slot.endTime = dto.endTime;
    if (dto.maxCapacity !== undefined) slot.maxCapacity = dto.maxCapacity;
    if (dto.serviceDays !== undefined) slot.serviceDays = dto.serviceDays;
    if (dto.isActive !== undefined) slot.isActive = dto.isActive;

    return this.deliverySlotRepository.save(slot);
  }

  async removeDeliverySlot(userId: string, id: string): Promise<void> {
    const provider = await this.findProviderOrThrow(userId);
    const slot = await this.deliverySlotRepository.findOne({
      where: { id, providerId: provider.id },
    });
    if (!slot) {
      throw new NotFoundException(`Delivery slot with ID ${id} not found.`);
    }
    await this.deliverySlotRepository.remove(slot);
  }

  async getDeliverySlots(userId: string): Promise<DeliverySlot[]> {
    const provider = await this.findProviderOrThrow(userId);
    return this.deliverySlotRepository.find({
      where: { providerId: provider.id },
    });
  }

  // ==========================================
  // KITCHEN CAPACITY MANAGEMENT
  // ==========================================

  async setKitchenCapacity(userId: string, dto: SetKitchenCapacityDto): Promise<KitchenCapacity> {
    const provider = await this.findProviderOrThrow(userId);
    const capacityDate = new Date(dto.date);

    let capacity = await this.kitchenCapacityRepository.findOne({
      where: {
        providerId: provider.id,
        mealType: dto.mealType,
        date: capacityDate,
      },
    });

    if (capacity) {
      capacity.maxCapacity = dto.maxCapacity;
    } else {
      capacity = this.kitchenCapacityRepository.create({
        providerId: provider.id,
        mealType: dto.mealType,
        maxCapacity: dto.maxCapacity,
        currentBookings: 0,
        date: capacityDate,
        isActive: true,
      });
    }

    return this.kitchenCapacityRepository.save(capacity);
  }

  async getKitchenCapacities(userId: string, startDate: Date, endDate: Date): Promise<KitchenCapacity[]> {
    const provider = await this.findProviderOrThrow(userId);
    return this.kitchenCapacityRepository.find({
      where: {
        providerId: provider.id,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }
}
