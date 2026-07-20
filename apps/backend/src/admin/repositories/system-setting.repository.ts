import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SystemSetting } from '../../database/entities/tracking.entity';

@Injectable()
export class SystemSettingRepository extends Repository<SystemSetting> {
  constructor(private dataSource: DataSource) {
    super(SystemSetting, dataSource.createEntityManager());
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    return this.findOne({ where: { key } });
  }

  async findByCategory(category: string): Promise<SystemSetting[]> {
    return this.find({ where: { category } });
  }
}
