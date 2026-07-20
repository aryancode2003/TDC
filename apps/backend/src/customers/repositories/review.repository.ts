import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Review } from '../../database/entities/tracking.entity';

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(private dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }

  async findByProviderId(providerId: string): Promise<Review[]> {
    return this.find({
      where: { providerId, isVisible: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCustomerId(customerId: string): Promise<Review[]> {
    return this.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
