import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('payments')
@Index(['customerId', 'providerId'])
@Index(['status'])
@Index(['razorpayPaymentId'])
@Index(['createdAt'])
export class Payment extends BaseEntity {
  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  subscriptionId?: string;

  @Column()
  customerId: string;

  @Column()
  providerId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'varchar', enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' })
  status: string;

  @Column({ type: 'varchar', enum: ['upi', 'card', 'netbanking', 'wallet'], default: 'upi' })
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

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

@Entity('wallets')
@Index(['customerId'], { unique: true })
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

@Entity('wallet_transactions')
@Index(['customerId', 'walletId'])
@Index(['type'])
@Index(['createdAt'])
export class WalletTransaction extends BaseEntity {
  @Column()
  walletId: string;

  @Column()
  customerId: string;

  @Column({ type: 'varchar', enum: ['credit', 'debit', 'refund', 'cashback', 'referral'] })
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
  referenceId?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

@Entity('coupons')
@Index(['code'], { unique: true })
@Index(['providerId'])
@Index(['validFrom', 'validUntil'])
export class Coupon extends BaseEntity {
  @Column()
  code: string;

  @Column({ nullable: true })
  providerId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'varchar', enum: ['percentage', 'fixed'] })
  discountType: string;

  @Column({ type: 'float' })
  discountValue: number;

  @Column({ type: 'float', nullable: true })
  maxDiscount?: number;

  @Column({ type: 'float', nullable: true })
  minOrderAmount?: number;

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date' })
  validUntil: Date;

  @Column({ type: 'integer', default: 0 })
  usageLimit: number;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'integer', default: 0 })
  limitPerCustomer: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  applicableMealTypes: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  applicableCategories: Record<string, any>;
}
