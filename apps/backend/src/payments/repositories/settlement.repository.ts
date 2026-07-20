import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Settlement } from '../../database/entities/business.entity';

@Injectable()
export class SettlementRepository extends Repository<Settlement> {
  constructor(private dataSource: DataSource) {
    super(Settlement, dataSource.createEntityManager());
  }

  async findByProviderId(providerId: string): Promise<Settlement[]> {
    return this.find({
      where: { providerId },
      order: { startDate: 'DESC' },
    });
  }

  async findPendingSettlements(): Promise<Settlement[]> {
    return this.find({ where: { status: 'pending' } });
  }
}
