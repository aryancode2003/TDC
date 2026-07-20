import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Customer } from '../../database/entities/provider.entity';

@Injectable()
export class CustomerRepository extends Repository<Customer> {
  constructor(private dataSource: DataSource) {
    super(Customer, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    return this.findOne({ where: { userId } });
  }
}
