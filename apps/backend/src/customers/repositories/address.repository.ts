import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Address } from '../../database/entities/location.entity';

@Injectable()
export class AddressRepository extends Repository<Address> {
  constructor(private dataSource: DataSource) {
    super(Address, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return this.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDefaultByUserId(userId: string): Promise<Address | null> {
    return this.findOne({ where: { userId, isDefault: true } });
  }
}
