import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
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
import { UsersModule } from '../users/users.module';
import {
  Customer,
  Address,
  Review,
  Waitlist,
  Provider,
  MealCategory,
  Meal,
  SubscriptionPlan,
  SubscriptionPlanMeal,
  ServiceArea,
  DeliverySlot,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Address,
      Review,
      Waitlist,
      Provider,
      MealCategory,
      Meal,
      SubscriptionPlan,
      SubscriptionPlanMeal,
      ServiceArea,
      DeliverySlot,
    ]),
    UsersModule,
  ],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomerRepository,
    AddressRepository,
    ReviewRepository,
    WaitlistRepository,
    ProviderRepository,
    MealCategoryRepository,
    MealRepository,
    SubscriptionPlanRepository,
    SubscriptionPlanMealRepository,
    ServiceAreaRepository,
    DeliverySlotRepository,
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
