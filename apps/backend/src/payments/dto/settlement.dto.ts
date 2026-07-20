import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ProcessSettlementDto {
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class SettlementResponseDto {
  id: string;
  providerId: string;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  commissionAmount: number;
  gatewayCharges: number;
  refunds: number;
  netAmount: number;
  status: string; // 'pending' | 'processed' | 'paid' | 'failed'
  paidAt?: Date;
  bankDetails: Record<string, any>;
  createdAt: Date;
}
