/**
 * All database entities
 * Export from this file to ensure consistent imports across the application
 */

export { BaseEntity } from './base.entity';

// User & Role Management
export { User } from './user.entity';
export { Role, Permission } from './role.entity';

// Provider & Customer
export { Provider, Customer } from './provider.entity';

// Meal Management
export { MealCategory, Meal, SubscriptionPlan, SubscriptionPlanMeal } from './meal.entity';

// Subscriptions & Orders
export { Subscription, Order } from './subscription.entity';

// Payments & Wallet
export { Payment, Wallet, WalletTransaction, Coupon } from './payment.entity';

// Location & Delivery
export { Address, ServiceArea, DeliverySlot, KitchenCapacity } from './location.entity';

// Reviews & Notifications
export { Review, Notification, AuditLog, SystemSetting } from './tracking.entity';

// Business
export { Referral, Waitlist, Settlement } from './business.entity';

/**
 * Entity Summary
 * 
 * Total Entities: 25+
 * 
 * User Management (3):
 * - User, Role, Permission, RolePermission
 * 
 * Core Business (2):
 * - Provider, Customer
 * 
 * Meal Management (4):
 * - MealCategory, Meal, SubscriptionPlan, SubscriptionPlanMeal
 * 
 * Subscriptions & Orders (2):
 * - Subscription, Order
 * 
 * Payments (4):
 * - Payment, Wallet, WalletTransaction, Coupon
 * 
 * Location & Delivery (4):
 * - Address, ServiceArea, DeliverySlot, KitchenCapacity
 * 
 * Reviews & System (4):
 * - Review, Notification, AuditLog, SystemSetting
 * 
 * Business & Growth (3):
 * - Referral, Waitlist, Settlement
 */
