import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('reviews')
@Index(['customerId', 'providerId'])
@Index(['overallRating'])
@Index(['createdAt'])
export class Review extends BaseEntity {
  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  subscriptionId?: string;

  @Column({ type: 'integer', default: 0 })
  foodRating: number;

  @Column({ type: 'integer', default: 0 })
  tasteRating: number;

  @Column({ type: 'integer', default: 0 })
  packagingRating: number;

  @Column({ type: 'integer', default: 0 })
  deliveryRating: number;

  @Column({ type: 'integer', default: 0 })
  quantityRating: number;

  @Column({ type: 'integer', default: 0 })
  overallRating: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb', default: '[]' })
  photos: string[];

  @Column({ type: 'jsonb', default: '[]' })
  videos: string[];

  @Column({ default: true })
  isVerifiedPurchase: boolean;

  @Column({ type: 'integer', default: 0 })
  helpfulCount: number;

  @Column({ default: true })
  isVisible: boolean;
}

@Entity('notifications')
@Index(['userId'])
@Index(['type'])
@Index(['isRead'])
@Index(['createdAt'])
export class Notification extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'varchar', enum: ['order_confirmed', 'order_delivered', 'payment_success', 'payment_failed', 'subscription_renewed', 'subscription_paused', 'subscription_cancelled', 'promo', 'alert', 'info'] })
  type: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'varchar', enum: ['push', 'sms', 'whatsapp', 'email', 'in_app'] })
  channel: string;
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['entityType', 'entityId'])
@Index(['action'])
@Index(['createdAt'])
export class AuditLog extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column()
  action: string;

  @Column({ type: 'jsonb', default: '{}' })
  changes: Record<string, any>;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

@Entity('system_settings')
@Index(['key'], { unique: true })
@Index(['category'])
export class SystemSetting extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column()
  category: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'varchar', enum: ['string', 'number', 'boolean', 'json'], default: 'string' })
  dataType: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  lastModifiedBy?: string;
}
