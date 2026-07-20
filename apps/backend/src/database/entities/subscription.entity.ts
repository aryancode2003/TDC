import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('subscriptions')
@Index(['customerId', 'providerId'])
@Index(['status'])
@Index(['startDate', 'endDate'])
@Index(['createdAt'])
export class Subscription extends BaseEntity {
  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column()
  planId: string;

  @Column({ type: 'varchar', enum: ['active', 'paused', 'cancelled', 'completed'], default: 'active' })
  status: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'float', default: 0 })
  paidAmount: number;

  @Column({ type: 'float', default: 0 })
  remainingAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  pausedUntil?: Date;

  @Column({ nullable: true })
  pauseReason?: string;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ type: 'integer', default: 0 })
  mealsDelivered: number;

  @Column({ type: 'integer', default: 0 })
  mealsMissed: number;

  @Column({ type: 'varchar', enum: ['breakfast', 'lunch', 'dinner', 'multiple'], default: 'breakfast' })
  mealType: string;

  @Column({ type: 'integer', default: 1 })
  deliveryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelReason?: string;

  @Column({ type: 'jsonb', default: '{}' })
  deliveryAddresses: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  preferences: Record<string, any>;
}

@Entity('orders')
@Index(['subscriptionId', 'customerId', 'providerId'])
@Index(['status'])
@Index(['orderDate'])
@Index(['deliveryDate'])
export class Order extends BaseEntity {
  @Column()
  subscriptionId: string;

  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date' })
  deliveryDate: Date;

  @Column({ type: 'varchar', enum: ['pending', 'confirmed', 'prepared', 'dispatched', 'delivered', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'varchar', enum: ['breakfast', 'lunch', 'dinner'] })
  mealType: string;

  @Column({ nullable: true })
  deliverySlotId?: string;

  @Column({ nullable: true })
  deliveryPersonId?: string;

  @Column({ type: 'jsonb', default: '[]' })
  items: Array<{ mealId: string; name: string; price: number; quantity: number }>;

  @Column({ default: false })
  confirmationRequired: boolean;

  @Column({ default: false })
  customerConfirmed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  deliveryLatitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  deliveryLongitude?: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
