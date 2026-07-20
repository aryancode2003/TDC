import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
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
import { UsersModule } from '../users/users.module';
import {
  Provider,
  MealCategory,
  Meal,
  SubscriptionPlan,
  SubscriptionPlanMeal,
  ServiceArea,
  DeliverySlot,
  KitchenCapacity,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      MealCategory,
      Meal,
      SubscriptionPlan,
      SubscriptionPlanMeal,
      ServiceArea,
      DeliverySlot,
      KitchenCapacity,
    ]),
    UsersModule,
  ],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    ProviderRepository,
    MealCategoryRepository,
    MealRepository,
    SubscriptionPlanRepository,
    SubscriptionPlanMealRepository,
    ServiceAreaRepository,
    DeliverySlotRepository,
    KitchenCapacityRepository,
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}
