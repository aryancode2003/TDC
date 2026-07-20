import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('referrals')
@Index(['referrerId'])
@Index(['referredCustomerId'])
@Index(['status'])
export class Referral extends BaseEntity {
  @Column()
  referrerId: string;

  @Column()
  referredCustomerId: string;

  @Column({ type: 'float', default: 0 })
  bonusAmount: number;

  @Column({ type: 'varchar', enum: ['pending', 'completed', 'claimed'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

@Entity('waitlist')
@Index(['pincode'])
@Index(['city'])
@Index(['status'])
@Index(['createdAt'])
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

  @Column({ type: 'varchar', enum: ['breakfast', 'lunch', 'dinner', 'all'], default: 'all' })
  preferredMealType: string;

  @Column({ type: 'varchar', enum: ['pending', 'notified', 'converted'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  notifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

@Entity('settlements')
@Index(['providerId', 'startDate'])
@Index(['status'])
@Index(['createdAt'])
export class Settlement extends BaseEntity {
  @Column()
  providerId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
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

  @Column({ type: 'varchar', enum: ['pending', 'processed', 'paid', 'failed'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  bankDetails: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
