import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from '../../database/entities/payment.entity';

@Injectable()
export class WalletRepository extends Repository<Wallet> {
  constructor(private dataSource: DataSource) {
    super(Wallet, dataSource.createEntityManager());
  }

  async findByCustomerId(customerId: string): Promise<Wallet | null> {
    return this.findOne({ where: { customerId } });
  }
}
