import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../../database/entities/payment.entity';

@Injectable()
export class PaymentRepository extends Repository<Payment> {
  constructor(private dataSource: DataSource) {
    super(Payment, dataSource.createEntityManager());
  }

  async findByCustomerId(customerId: string): Promise<Payment[]> {
    return this.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByProviderId(providerId: string): Promise<Payment[]> {
    return this.find({
      where: { providerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    return this.findOne({ where: { razorpayOrderId } });
  }
}
