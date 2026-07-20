/**
 * Base Entity
 * All entities inherit from this to include common fields
 */
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

/**
 * Tenant
 * Represents each independent instance of the platform
 * Future: For multi-SaaS scenarios
 */
export class Tenant extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;
}

/**
 * Role
 * Define access levels: Super Admin, Admin, Support, Finance, Partner, Customer
 */
export class Role extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ['super_admin', 'admin', 'support', 'finance', 'partner', 'partner_manager', 'delivery', 'customer'] })
  type: string;

  @Column({ default: true })
  isActive: boolean;
}

/**
 * Permission
 * Granular permissions for RBAC
 */
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  resource: string; // 'users', 'providers', 'orders', etc.

  @Column()
  action: string; // 'create', 'read', 'update', 'delete'

  @Column({ default: true })
  isActive: boolean;
}

/**
 * RolePermission
 * Junction table for Role-Permission relationship
 */
export class RolePermission extends BaseEntity {
  @Column()
  roleId: string;

  @Column()
  permissionId: string;
}

/**
 * User
 * Base user entity - inherited by Customer, Provider, Admin
 */
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: ['customer', 'provider', 'admin'] })
  userType: string;

  @Column()
  roleId: string;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * Customer
 * Extension of User for customer-specific data
 */
export class Customer extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'integer', default: 0 })
  totalSubscriptions: number;

  @Column({ type: 'integer', default: 0 })
  activeSubscriptions: number;

  @Column({ type: 'float', default: 0 })
  totalSpent: number;

  @Column({ type: 'float', default: 0 })
  avgRating: number;

  @Column({ type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ nullable: true })
  preferredProviderId?: string;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;
}

/**
 * Provider
 * Extension of User for tiffin provider businesses
 */
export class Provider extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  businessName: string;

  @Column()
  businessLogo?: string;

  @Column()
  businessBanner?: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  gstNumber: string;

  @Column()
  panNumber: string;

  @Column()
  fssaiNumber: string;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'suspended', 'blacklisted'] })
  verificationStatus: string;

  @Column({ type: 'float', default: 0 })
  avgRating: number;

  @Column({ type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ type: 'integer', default: 0 })
  mealsDelivered: number;

  @Column({ type: 'integer', default: 0 })
  yearsActive: number;

  @Column({ type: 'float', default: 0 })
  commissionRate: number;

  @Column({ type: 'integer', default: 0 })
  activeSubscribers: number;

  @Column({ type: 'integer', default: 0 })
  totalSubscriptions: number;

  @Column({ type: 'jsonb', default: {} })
  bankDetails: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  verificationDocuments: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * Address
 * User addresses (home, office, hostel, PG, etc.)
 */
export class Address extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  type: string; // 'home', 'office', 'hostel', 'pg'

  @Column()
  street: string;

  @Column()
  locality: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ default: false })
  isDefault: boolean;
}

/**
 * ServiceArea
 * Geographic areas served by providers
 */
export class ServiceArea extends BaseEntity {
  @Column()
  providerId: string;

  @Column()
  pincode: string;

  @Column()
  locality?: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deliveryRadius?: number; // in kilometers

  @Column({ default: true })
  isActive: boolean;
}

/**
 * MealCategory
 * Categories like Breakfast, Lunch, Dinner, Snacks, etc.
 */
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

/**
 * Meal
 * Individual meal items
 */
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

  @Column({ type: 'enum', enum: ['veg', 'non-veg', 'jain'] })
  type: string;

  @Column({ type: 'enum', enum: ['normal', 'healthy', 'gym', 'diet'] })
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

  @Column({ type: 'jsonb', default: {} })
  nutrients?: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  allergens?: string[];

  @Column({ type: 'jsonb', default: {} })
  ingredients?: string[];
}

/**
 * SubscriptionPlan
 * Different plan types: Weekly, Bi-weekly, Monthly, Quarterly, Custom
 */
export class SubscriptionPlan extends BaseEntity {
  @Column()
  providerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'custom'] })
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

  @Column({ type: 'jsonb', default: {} })
  includedCategories: Record<string, any>; // {breakfast: true, lunch: true, dinner: false}

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;
}

/**
 * SubscriptionPlanMeal
 * Meals included in each plan
 */
export class SubscriptionPlanMeal extends BaseEntity {
  @Column()
  planId: string;

  @Column()
  mealId: string;

  @Column()
  day: number; // 0-6 (Monday-Sunday)

  @Column({ type: 'integer' })
  quantity: number;
}

/**
 * Subscription
 * Active meal subscriptions for customers
 */
export class Subscription extends BaseEntity {
  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column()
  planId: string;

  @Column({ type: 'enum', enum: ['active', 'paused', 'cancelled', 'completed'] })
  status: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column()
  totalPrice: number;

  @Column({ type: 'float', default: 0 })
  paidAmount: number;

  @Column({ type: 'float', default: 0 })
  remainingAmount: number;

  @Column({ nullable: true })
  pausedUntil?: Date;

  @Column({ nullable: true })
  pauseReason?: string;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ type: 'integer', default: 0 })
  mealsDelivered: number;

  @Column({ type: 'integer', default: 0 })
  mealsMissed: number;

  @Column({ type: 'enum', enum: ['breakfast', 'lunch', 'dinner', 'multiple'] })
  mealType: string;

  @Column({ type: 'integer', default: 1 })
  deliveryCount: number;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelReason?: string;

  @Column({ type: 'jsonb', default: {} })
  deliveryAddresses: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;
}

/**
 * DeliverySlot
 * Available delivery time windows
 */
export class DeliverySlot extends BaseEntity {
  @Column()
  providerId: string;

  @Column({ type: 'enum', enum: ['breakfast', 'lunch', 'dinner'] })
  mealType: string;

  @Column()
  startTime: string; // HH:MM format

  @Column()
  endTime: string; // HH:MM format

  @Column({ type: 'integer', default: 0 })
  maxCapacity: number;

  @Column({ type: 'integer', default: 0 })
  currentBookings: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  serviceDays: Record<string, boolean>; // {monday: true, tuesday: true, ...}
}

/**
 * Order
 * Daily meal orders (one per subscription per day)
 */
export class Order extends BaseEntity {
  @Column()
  subscriptionId: string;

  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column()
  orderDate: Date;

  @Column()
  deliveryDate: Date;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'prepared', 'dispatched', 'delivered', 'cancelled'] })
  status: string;

  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'enum', enum: ['breakfast', 'lunch', 'dinner'] })
  mealType: string;

  @Column({ nullable: true })
  deliverySlotId?: string;

  @Column({ nullable: true })
  deliveryPersonId?: string;

  @Column({ type: 'jsonb', default: [] })
  items: Array<{ mealId: string; name: string; price: number; quantity: number }>;

  @Column({ default: false })
  confirmationRequired: boolean;

  @Column({ default: false })
  customerConfirmed: boolean;

  @Column({ nullable: true })
  confirmedAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelReason?: string;

  @Column({ nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  deliveryLatitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  deliveryLongitude?: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * Payment
 * Payment transactions
 */
export class Payment extends BaseEntity {
  @Column()
  orderId?: string;

  @Column()
  subscriptionId?: string;

  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'refunded'] })
  status: string;

  @Column({ type: 'enum', enum: ['upi', 'card', 'netbanking', 'wallet'] })
  paymentMethod: string;

  @Column({ nullable: true })
  razorpayOrderId?: string;

  @Column({ nullable: true })
  razorpayPaymentId?: string;

  @Column({ nullable: true })
  razorpaySignature?: string;

  @Column({ type: 'float', default: 0 })
  gatewayCharges: number;

  @Column({ type: 'float', default: 0 })
  platformCommission: number;

  @Column({ type: 'float', default: 0 })
  providerAmount: number;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * Wallet
 * Customer wallet for credits, refunds, cashback
 */
export class Wallet extends BaseEntity {
  @Column()
  customerId: string;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'float', default: 0 })
  totalCredits: number;

  @Column({ type: 'float', default: 0 })
  totalRefunds: number;

  @Column({ type: 'float', default: 0 })
  totalCashback: number;

  @Column({ type: 'float', default: 0 })
  totalReferralBonus: number;
}

/**
 * WalletTransaction
 * Transaction history
 */
export class WalletTransaction extends BaseEntity {
  @Column()
  walletId: string;

  @Column()
  customerId: string;

  @Column({ type: 'enum', enum: ['credit', 'debit', 'refund', 'cashback', 'referral'] })
  type: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'float' })
  balanceBefore: number;

  @Column({ type: 'float' })
  balanceAfter: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  referenceId?: string; // paymentId, refundId, etc.

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * Coupon
 * Discount coupons and promotional codes
 */
export class Coupon extends BaseEntity {
  @Column()
  code: string;

  @Column()
  providerId?: string; // null = global coupon

  @Column()
  description?: string;

  @Column({ type: 'enum', enum: ['percentage', 'fixed'] })
  discountType: string;

  @Column({ type: 'float' })
  discountValue: number;

  @Column({ type: 'float', nullable: true })
  maxDiscount?: number;

  @Column({ type: 'float', nullable: true })
  minOrderAmount?: number;

  @Column()
  validFrom: Date;

  @Column()
  validUntil: Date;

  @Column({ type: 'integer', default: 0 })
  usageLimit: number;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'integer', default: 0 })
  limitPerCustomer: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  applicableMealTypes: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  applicableCategories: Record<string, any>;
}

/**
 * Review
 * Customer reviews and ratings
 */
export class Review extends BaseEntity {
  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column()
  orderId?: string;

  @Column()
  subscriptionId?: string;

  @Column({ type: 'integer', default: 0 })
  foodRating: number; // 1-5

  @Column({ type: 'integer', default: 0 })
  tasteRating: number; // 1-5

  @Column({ type: 'integer', default: 0 })
  packagingRating: number; // 1-5

  @Column({ type: 'integer', default: 0 })
  deliveryRating: number; // 1-5

  @Column({ type: 'integer', default: 0 })
  quantityRating: number; // 1-5

  @Column({ type: 'integer', default: 0 })
  overallRating: number; // 1-5

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb', default: [] })
  photos: string[];

  @Column({ type: 'jsonb', default: [] })
  videos: string[];

  @Column({ default: true })
  isVerifiedPurchase: boolean;

  @Column({ type: 'integer', default: 0 })
  helpfulCount: number;

  @Column({ default: true })
  isVisible: boolean;
}

/**
 * Notification
 * Event-driven notifications
 */
export class Notification extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: ['order_confirmed', 'order_delivered', 'payment_success', 'payment_failed', 'subscription_renewed', 'subscription_paused', 'subscription_cancelled', 'promo', 'alert', 'info'] })
  type: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt?: Date;

  @Column({ default: false })
  isSent: boolean;

  @Column({ nullable: true })
  sentAt?: Date;

  @Column({ type: 'enum', enum: ['push', 'sms', 'whatsapp', 'email', 'in_app'] })
  channel: string;
}

/**
 * AuditLog
 * Track all important actions
 */
export class AuditLog extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  entityType: string; // 'User', 'Order', 'Payment', etc.

  @Column()
  entityId: string;

  @Column()
  action: string; // 'CREATE', 'UPDATE', 'DELETE'

  @Column({ type: 'jsonb', default: {} })
  changes: Record<string, any>; // {field: {before: value, after: value}}

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * SystemSetting
 * Global platform configuration
 */
export class SystemSetting extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column()
  category: string; // 'payment', 'notification', 'commission', 'general'

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['string', 'number', 'boolean', 'json'] })
  dataType: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  lastModifiedBy?: string;
}

/**
 * KitchenCapacity
 * Daily capacity per meal type
 */
export class KitchenCapacity extends BaseEntity {
  @Column()
  providerId: string;

  @Column({ type: 'enum', enum: ['breakfast', 'lunch', 'dinner'] })
  mealType: string;

  @Column({ type: 'integer' })
  maxCapacity: number;

  @Column({ type: 'integer', default: 0 })
  currentBookings: number;

  @Column()
  date: Date; // For time-series tracking

  @Column({ default: true })
  isActive: boolean;
}

/**
 * Referral
 * Referral program tracking
 */
export class Referral extends BaseEntity {
  @Column()
  referrerId: string;

  @Column()
  referredCustomerId: string;

  @Column({ type: 'float', default: 0 })
  bonusAmount: number;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'claimed'] })
  status: string;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * Waitlist
 * Customers waiting for service in their area
 */
export class Waitlist extends BaseEntity {
  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  pincode: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ type: 'enum', enum: ['breakfast', 'lunch', 'dinner', 'all'] })
  preferredMealType: string;

  @Column({ type: 'enum', enum: ['pending', 'notified', 'converted'] })
  status: string;

  @Column({ nullable: true })
  notifiedAt?: Date;

  @Column({ nullable: true })
  convertedAt?: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}

/**
 * Settlement
 * Provider payment settlements
 */
export class Settlement extends BaseEntity {
  @Column()
  providerId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'float' })
  totalRevenue: number;

  @Column({ type: 'float' })
  commissionAmount: number;

  @Column({ type: 'float' })
  gatewayCharges: number;

  @Column({ type: 'float' })
  refunds: number;

  @Column({ type: 'float' })
  netAmount: number;

  @Column({ type: 'enum', enum: ['pending', 'processed', 'paid', 'failed'] })
  status: string;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ type: 'jsonb', default: {} })
  bankDetails: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}
