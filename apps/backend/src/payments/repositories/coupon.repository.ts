import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Coupon } from '../../database/entities/payment.entity';

@Injectable()
export class CouponRepository extends Repository<Coupon> {
  constructor(private dataSource: DataSource) {
    super(Coupon, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.findOne({ where: { code, isActive: true } });
  }

  async findActiveCoupons(): Promise<Coupon[]> {
    return this.find({ where: { isActive: true } });
  }

  async findProviderCoupons(providerId: string): Promise<Coupon[]> {
    return this.find({
      where: [
        { providerId, isActive: true },
        { providerId: undefined, isActive: true }, // Global coupons
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
