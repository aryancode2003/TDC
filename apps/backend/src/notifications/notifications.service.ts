import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { Notification } from '../database/entities';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notification.dto';
import { UserRepository } from '../users/repositories/user.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private notificationRepository: NotificationRepository,
    private userRepository: UserRepository,
  ) {}

  /**
   * Send notification over specified channel (push, sms, whatsapp, email, in_app)
   */
  async sendNotification(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found.`);
    }

    const notification = this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      description: dto.description,
      channel: dto.channel,
      actionUrl: dto.actionUrl,
      metadata: dto.metadata || {},
      isRead: false,
      isSent: false,
    });

    // Save notification first in database
    const saved = await this.notificationRepository.save(notification);

    // Dispatch over respective channel stub
    let dispatchedSuccess = false;
    try {
      switch (dto.channel) {
        case 'push':
          dispatchedSuccess = await this.dispatchPush(dto.userId, dto.title, dto.description, dto.metadata);
          break;
        case 'sms':
          dispatchedSuccess = await this.dispatchSms(dto.userId, dto.description);
          break;
        case 'whatsapp':
          dispatchedSuccess = await this.dispatchWhatsApp(dto.userId, dto.description);
          break;
        case 'email':
          dispatchedSuccess = await this.dispatchEmail(dto.userId, dto.title, dto.description);
          break;
        case 'in_app':
          dispatchedSuccess = true;
          break;
        default:
          dispatchedSuccess = false;
      }
    } catch (e) {
      console.error(`[NOTIFICATION FAILURE] Channel: ${dto.channel}, Error:`, e);
    }

    if (dispatchedSuccess) {
      saved.isSent = true;
      saved.sentAt = new Date();
      await this.notificationRepository.save(saved);
    }

    return this.mapToResponseDto(saved);
  }

  // ==========================================
  // INBOX READ & LIST
  // ==========================================

  async getUserNotifications(userId: string): Promise<NotificationResponseDto[]> {
    const list = await this.notificationRepository.findByUserId(userId);
    return list.map(n => this.mapToResponseDto(n));
  }

  async getUnreadNotifications(userId: string): Promise<NotificationResponseDto[]> {
    const list = await this.notificationRepository.findUnreadByUserId(userId);
    return list.map(n => this.mapToResponseDto(n));
  }

  async markAsRead(userId: string, id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found.`);
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    return this.mapToResponseDto(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const unread = await this.notificationRepository.find({
      where: { userId, isRead: false },
    });

    if (unread.length > 0) {
      const now = new Date();
      unread.forEach(n => {
        n.isRead = true;
        n.readAt = now;
      });
      await this.notificationRepository.save(unread);
    }
  }

  async deleteNotification(userId: string, id: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found.`);
    }

    await this.notificationRepository.remove(notification);
  }

  // ==========================================
  // DISPATCH CHANNELS STUBS
  // ==========================================

  private async dispatchPush(userId: string, title: string, body: string, metadata: any): Promise<boolean> {
    console.log(`[PUSH STUB] Sending FCM push to user ${userId}: "${title}" - ${body} (metadata: ${JSON.stringify(metadata)})`);
    return true;
  }

  private async dispatchSms(userId: string, body: string): Promise<boolean> {
    console.log(`[SMS STUB] Sending SMS to user ${userId}: ${body}`);
    return true;
  }

  private async dispatchWhatsApp(userId: string, body: string): Promise<boolean> {
    console.log(`[WHATSAPP STUB] Sending WhatsApp msg to user ${userId}: ${body}`);
    return true;
  }

  private async dispatchEmail(userId: string, subject: string, body: string): Promise<boolean> {
    console.log(`[EMAIL STUB] Sending Email to user ${userId} with subject "${subject}": ${body}`);
    return true;
  }

  // ==========================================
  // MAPPER FUNCTIONS
  // ==========================================

  private mapToResponseDto(n: Notification): NotificationResponseDto {
    return {
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      description: n.description,
      actionUrl: n.actionUrl,
      metadata: n.metadata,
      isRead: n.isRead,
      readAt: n.readAt,
      isSent: n.isSent,
      sentAt: n.sentAt,
      channel: n.channel,
      createdAt: n.createdAt,
    };
  }
}
