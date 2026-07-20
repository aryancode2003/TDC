import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProviderRepository } from '../providers/repositories/provider.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { SystemSettingRepository } from './repositories/system-setting.repository';
import { WaitlistRepository } from '../customers/repositories/waitlist.repository';
import { Provider, Customer, SystemSetting, Payment, Subscription, Order, Waitlist } from '../database/entities';
import { UpdateProviderStatusDto, GlobalAnalyticsResponseDto } from './dto/admin.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private providerRepository: ProviderRepository,
    private customerRepository: CustomerRepository,
    private systemSettingRepository: SystemSettingRepository,
    private waitlistRepository: WaitlistRepository,
    private notificationsService: NotificationsService,
    private dataSource: DataSource,
  ) {}

  // ==========================================
  // PROVIDER & CUSTOMER CONTROL
  // ==========================================

  async updateProviderVerificationStatus(providerId: string, dto: UpdateProviderStatusDto): Promise<Provider> {
    const provider = await this.providerRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${providerId} not found.`);
    }

    provider.verificationStatus = dto.verificationStatus;
    if (dto.verificationStatus === 'approved') {
      provider.approvedAt = new Date();
    }
    if (dto.commissionRate !== undefined) {
      provider.commissionRate = dto.commissionRate;
    }

    const saved = await this.providerRepository.save(provider);

    // Notify provider of status change
    await this.notificationsService.sendNotification({
      userId: provider.userId,
      type: 'alert',
      title: 'Kitchen Verification Status Updated',
      description: `Your tiffin service kitchen registration status has been updated to: ${dto.verificationStatus.toUpperCase()}.`,
      channel: 'push',
    });

    return saved;
  }

  async listProviders(status?: string): Promise<Provider[]> {
    if (status) {
      return this.providerRepository.find({ where: { verificationStatus: status } });
    }
    return this.providerRepository.find();
  }

  async listCustomers(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  // ==========================================
  // GLOBAL ANALYTICS
  // ==========================================

  async getGlobalAnalytics(): Promise<GlobalAnalyticsResponseDto> {
    const manager = this.dataSource.manager;

    // Aggregate payment completions
    const paymentSum = await manager.createQueryBuilder(Payment, 'payment')
      .select('SUM(payment.amount)', 'gmv')
      .addSelect('SUM(payment.platformCommission)', 'revenue')
      .where('payment.status = :status', { status: 'completed' })
      .getRawOne();

    const totalGMV = parseFloat(paymentSum?.gmv || 0);
    const totalRevenue = parseFloat(paymentSum?.revenue || 0);

    // Count providers, customers, orders
    const activeProviders = await this.providerRepository.count({
      where: { verificationStatus: 'approved', isActive: true },
    });


    // Let's query active customer count by fetching where activeSubscriptions > 0
    const qbCust = this.customerRepository.createQueryBuilder('customer')
      .where('customer.activeSubscriptions > 0');
    const activeCustomersCount = await qbCust.getCount();

    const totalSubscriptions = await manager.count(Subscription);
    const activeSubscriptions = await manager.count(Subscription, { where: { status: 'active' } });
    const totalOrders = await manager.count(Order);
    
    const waitlistCount = await this.waitlistRepository.count({ where: { status: 'pending' } });

    return {
      totalGMV,
      totalRevenue,
      activeProviders,
      activeCustomers: activeCustomersCount,
      totalSubscriptions,
      activeSubscriptions,
      totalOrders,
      waitlistCount,
    };
  }

  // ==========================================
  // CONFIGURATION & SETTINGS
  // ==========================================

  async updateSystemSetting(key: string, value: any): Promise<SystemSetting> {
    let setting = await this.systemSettingRepository.findByKey(key);
    if (!setting) {
      setting = this.systemSettingRepository.create({
        key,
        value,
        category: 'global',
        dataType: typeof value === 'object' ? 'json' : typeof value,
        isPublic: true,
      });
    } else {
      setting.value = value;
    }
    return this.systemSettingRepository.save(setting);
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return this.systemSettingRepository.find();
  }

  async getWaitlistSummary(): Promise<any[]> {
    const manager = this.dataSource.manager;
    const results = await manager.createQueryBuilder(Waitlist, 'waitlist')
      .select('waitlist.pincode', 'pincode')
      .addSelect('MAX(waitlist.city)', 'locality')
      .addSelect('COUNT(waitlist.id)', 'count')
      .addSelect('SUM(CASE WHEN waitlist.status = \'pending\' THEN 1 ELSE 0 END)', 'pendingCount')
      .groupBy('waitlist.pincode')
      .getRawMany();

    return results.map(r => ({
      pincode: r.pincode,
      location: r.locality,
      count: parseInt(r.count || 0),
      status: parseInt(r.pendingCount || 0) > 0 ? 'Active' : 'Notified'
    }));
  }

  // ==========================================
  // WAITLIST CONVERSION
  // ==========================================

  async convertWaitlist(pincode: string): Promise<{ notifiedCount: number }> {
    const list = await this.waitlistRepository.find({
      where: { pincode, status: 'pending' },
    });

    if (list.length === 0) {
      return { notifiedCount: 0 };
    }

    const now = new Date();
    for (const wait of list) {
      wait.status = 'notified';
      wait.notifiedAt = now;

      // Check if user exists with waitlist phone to trigger in-app/push notification
      const user = await this.dataSource.manager.createQueryBuilder('users', 'u')
        .where('u.phone = :phone', { phone: wait.phone })
        .getRawOne();

      if (user) {
        await this.notificationsService.sendNotification({
          userId: user.id || user.u_id,
          type: 'promo',
          title: 'Tiffin Services Now Live!',
          description: `Great news ${wait.name}! Tiffin providers are now servicing your pincode area ${pincode}. Discover today!`,
          channel: 'push',
        });
      } else {
        // If not registered user, mock an SMS notification
        console.log(`[SMS STUB] Sending waitlist notification SMS to ${wait.phone}: Tiffin services now live in area ${pincode}!`);
      }
    }

    await this.waitlistRepository.save(list);
    return { notifiedCount: list.length };
  }
}
