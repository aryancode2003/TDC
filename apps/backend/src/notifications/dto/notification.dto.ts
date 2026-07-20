import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string; // 'order_confirmed' | 'order_delivered' | 'payment_success' | etc.

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsEnum(['push', 'sms', 'whatsapp', 'email', 'in_app'])
  channel: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class NotificationResponseDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  actionUrl?: string;
  metadata: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  isSent: boolean;
  sentAt?: Date;
  channel: string;
  createdAt: Date;
}
