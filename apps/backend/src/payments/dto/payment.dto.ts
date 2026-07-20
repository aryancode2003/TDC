import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string; // 'upi' | 'card' | 'netbanking' | 'wallet'
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}

export class PaymentResponseDto {
  id: string;
  orderId?: string;
  subscriptionId?: string;
  customerId: string;
  providerId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  gatewayCharges: number;
  platformCommission: number;
  providerAmount: number;
  failureReason?: string;
  completedAt?: Date;
  createdAt: Date;
}
