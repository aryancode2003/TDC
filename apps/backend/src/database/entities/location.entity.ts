import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('addresses')
@Index(['userId'])
export class Address extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  type: string;

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

@Entity('service_areas')
@Index(['providerId'])
@Index(['pincode'])
@Index(['city'])
export class ServiceArea extends BaseEntity {
  @Column()
  providerId: string;

  @Column()
  pincode: string;

  @Column({ nullable: true })
  locality?: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deliveryRadius?: number;

  @Column({ default: true })
  isActive: boolean;
}

@Entity('delivery_slots')
@Index(['providerId', 'mealType'])
@Index(['isActive'])
export class DeliverySlot extends BaseEntity {
  @Column()
  providerId: string;

  @Column({ type: 'varchar', enum: ['breakfast', 'lunch', 'dinner'] })
  mealType: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ type: 'integer', default: 0 })
  maxCapacity: number;

  @Column({ type: 'integer', default: 0 })
  currentBookings: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  serviceDays: Record<string, boolean>;
}

@Entity('kitchen_capacity')
@Index(['providerId', 'date'])
@Index(['mealType'])
export class KitchenCapacity extends BaseEntity {
  @Column()
  providerId: string;

  @Column({ type: 'varchar', enum: ['breakfast', 'lunch', 'dinner'] })
  mealType: string;

  @Column({ type: 'integer' })
  maxCapacity: number;

  @Column({ type: 'integer', default: 0 })
  currentBookings: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: true })
  isActive: boolean;
}
