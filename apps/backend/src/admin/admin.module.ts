import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SystemSettingRepository } from './repositories/system-setting.repository';
import { ProviderRepository } from '../providers/repositories/provider.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { WaitlistRepository } from '../customers/repositories/waitlist.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { SystemSetting, Provider, Customer, Waitlist } from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting, Provider, Customer, Waitlist]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    SystemSettingRepository,
    ProviderRepository,
    CustomerRepository,
    WaitlistRepository,
  ],
  exports: [AdminService],
})
export class AdminModule {}
