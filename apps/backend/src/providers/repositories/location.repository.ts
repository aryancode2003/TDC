import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ServiceArea, DeliverySlot, KitchenCapacity } from '../../database/entities';

@Injectable()
export class ServiceAreaRepository extends Repository<ServiceArea> {
  constructor(private dataSource: DataSource) {
    super(ServiceArea, dataSource.createEntityManager());
  }
}

@Injectable()
export class DeliverySlotRepository extends Repository<DeliverySlot> {
  constructor(private dataSource: DataSource) {
    super(DeliverySlot, dataSource.createEntityManager());
  }
}

@Injectable()
export class KitchenCapacityRepository extends Repository<KitchenCapacity> {
  constructor(private dataSource: DataSource) {
    super(KitchenCapacity, dataSource.createEntityManager());
  }
}
