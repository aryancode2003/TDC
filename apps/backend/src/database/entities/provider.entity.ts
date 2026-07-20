import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('customers')
@Index(['userId'], { unique: true })
@Index(['totalSpent'])
@Index(['avgRating'])
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

  @Column({ type: 'jsonb', default: '{}' })
  preferences: Record<string, any>;
}

@Entity('providers')
@Index(['userId'], { unique: true })
@Index(['verificationStatus'])
@Index(['avgRating'])
@Index(['activeSubscribers'])
@Index(['createdAt'])
export class Provider extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  businessLogo?: string;

  @Column({ nullable: true })
  businessBanner?: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  gstNumber: string;

  @Column()
  panNumber: string;

  @Column()
  fssaiNumber: string;

  @Column({ type: 'varchar', enum: ['pending', 'approved', 'rejected', 'suspended', 'blacklisted'], default: 'pending' })
  verificationStatus: string;

  @Column({ type: 'float', default: 0 })
  avgRating: number;

  @Column({ type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ type: 'integer', default: 0 })
  mealsDelivered: number;

  @Column({ type: 'integer', default: 0 })
  yearsActive: number;

  @Column({ type: 'float', default: 15 })
  commissionRate: number;

  @Column({ type: 'integer', default: 0 })
  activeSubscribers: number;

  @Column({ type: 'integer', default: 0 })
  totalSubscriptions: number;

  @Column({ type: 'jsonb', default: '{}' })
  bankDetails: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  verificationDocuments: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
