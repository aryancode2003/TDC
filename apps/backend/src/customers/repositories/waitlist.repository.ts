import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Waitlist } from '../../database/entities/business.entity';

@Injectable()
export class WaitlistRepository extends Repository<Waitlist> {
  constructor(private dataSource: DataSource) {
    super(Waitlist, dataSource.createEntityManager());
  }
}
