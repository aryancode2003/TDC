import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MealCategory, Meal, SubscriptionPlan, SubscriptionPlanMeal } from '../../database/entities';

@Injectable()
export class MealCategoryRepository extends Repository<MealCategory> {
  constructor(private dataSource: DataSource) {
    super(MealCategory, dataSource.createEntityManager());
  }
}

@Injectable()
export class MealRepository extends Repository<Meal> {
  constructor(private dataSource: DataSource) {
    super(Meal, dataSource.createEntityManager());
  }
}

@Injectable()
export class SubscriptionPlanRepository extends Repository<SubscriptionPlan> {
  constructor(private dataSource: DataSource) {
    super(SubscriptionPlan, dataSource.createEntityManager());
  }
}

@Injectable()
export class SubscriptionPlanMealRepository extends Repository<SubscriptionPlanMeal> {
  constructor(private dataSource: DataSource) {
    super(SubscriptionPlanMeal, dataSource.createEntityManager());
  }
}
