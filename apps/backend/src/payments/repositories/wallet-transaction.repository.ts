import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WalletTransaction } from '../../database/entities/payment.entity';

@Injectable()
export class WalletTransactionRepository extends Repository<WalletTransaction> {
  constructor(private dataSource: DataSource) {
    super(WalletTransaction, dataSource.createEntityManager());
  }

  async findByWalletId(walletId: string): Promise<WalletTransaction[]> {
    return this.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCustomerId(customerId: string): Promise<WalletTransaction[]> {
    return this.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
