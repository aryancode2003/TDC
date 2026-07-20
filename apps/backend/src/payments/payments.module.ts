import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletTransactionRepository } from './repositories/wallet-transaction.repository';
import { CouponRepository } from './repositories/coupon.repository';
import { SettlementRepository } from './repositories/settlement.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ProviderRepository } from '../providers/repositories/provider.repository';
import { UsersModule } from '../users/users.module';
import {
  Payment,
  Wallet,
  WalletTransaction,
  Coupon,
  Settlement,
  Customer,
  Provider,
  Subscription,
  Order,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Wallet,
      WalletTransaction,
      Coupon,
      Settlement,
      Customer,
      Provider,
      Subscription,
      Order,
    ]),
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentRepository,
    WalletRepository,
    WalletTransactionRepository,
    CouponRepository,
    SettlementRepository,
    CustomerRepository,
    ProviderRepository,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
