import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('meal_categories')
@Index(['providerId', 'isActive'])
export class MealCategory extends BaseEntity {
  @Column()
  providerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemDefault: boolean;
}

@Entity('meals')
@Index(['providerId', 'categoryId'])
@Index(['type'])
@Index(['createdAt'])
export class Meal extends BaseEntity {
  @Column()
  providerId: string;

  @Column()
  categoryId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', enum: ['veg', 'non-veg', 'jain'], default: 'veg' })
  type: string;

  @Column({ type: 'varchar', enum: ['normal', 'healthy', 'gym', 'diet'], default: 'normal' })
  specialization: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'integer', default: 0 })
  calorieCount?: number;

  @Column({ type: 'float', default: 0 })
  preparationTime?: number;

  @Column({ type: 'integer', default: 0 })
  servings?: number;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  nutrients?: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  allergens?: string[];

  @Column({ type: 'jsonb', default: '[]' })
  ingredients?: string[];
}

@Entity('subscription_plans')
@Index(['providerId', 'isActive'])
@Index(['planType'])
export class SubscriptionPlan extends BaseEntity {
  @Column()
  providerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'varchar', enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'custom'] })
  planType: string;

  @Column({ type: 'integer' })
  durationDays: number;

  @Column({ type: 'float' })
  basePrice: number;

  @Column({ type: 'float', default: 0 })
  discountPercentage: number;

  @Column({ type: 'float', default: 0 })
  deliveryCharges: number;

  @Column({ type: 'float', default: 0 })
  packagingCharges: number;

  @Column({ type: 'float', default: 0 })
  depositAmount: number;

  @Column({ type: 'float', default: 0 })
  taxPercentage: number;

  @Column({ type: 'integer', default: 0 })
  totalMeals: number;

  @Column({ type: 'jsonb', default: '{}' })
  includedCategories: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;
}

@Entity('subscription_plan_meals')
@Index(['planId', 'mealId'])
export class SubscriptionPlanMeal extends BaseEntity {
  @Column()
  planId: string;

  @Column()
  mealId: string;

  @Column({ type: 'integer' })
  day: number;

  @Column({ type: 'integer' })
  quantity: number;
}
