import { IsNumber, Min } from 'class-validator';

export class LoadWalletDto {
  @IsNumber()
  @Min(10)
  amount: number;
}

export class WalletResponseDto {
  id: string;
  customerId: string;
  balance: number;
  totalCredits: number;
  totalRefunds: number;
  totalCashback: number;
  totalReferralBonus: number;
  createdAt: Date;
  updatedAt: Date;
}

export class WalletTransactionResponseDto {
  id: string;
  walletId: string;
  customerId: string;
  type: string; // 'credit' | 'debit' | 'refund' | 'cashback' | 'referral'
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: Date;
}
