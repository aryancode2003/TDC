import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Provider } from '../../database/entities/provider.entity';

@Injectable()
export class ProviderRepository extends Repository<Provider> {
  constructor(private dataSource: DataSource) {
    super(Provider, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Provider | null> {
    return this.findOne({ where: { userId } });
  }

  async findActiveProviders(): Promise<Provider[]> {
    return this.find({ where: { isActive: true, verificationStatus: 'approved' } });
  }
}
