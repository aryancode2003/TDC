import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Notifications Inbox')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user notifications feed (push inbox)' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of user notifications feed retrieved', type: [NotificationResponseDto] })
  async getNotifications(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<NotificationResponseDto[]> {
    const isUnread = unreadOnly === 'true';
    if (isUnread) {
      return this.notificationsService.getUnreadNotifications(req.user.sub);
    }
    return this.notificationsService.getUserNotifications(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification state set to read', type: NotificationResponseDto })
  async markRead(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all unread notifications of the user as read' })
  @ApiResponse({ status: 200, description: 'All notifications set to read successfully' })
  async readAll(@Request() req: any): Promise<void> {
    await this.notificationsService.markAllAsRead(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification from inbox' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  async deleteNotification(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<void> {
    await this.notificationsService.deleteNotification(req.user.sub, id);
  }

  // ==========================================
  // SYSTEM & ADMIN TRIGGERS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Post('trigger')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger/send a system notification to a specific user (Admins only)' })
  @ApiResponse({ status: 201, description: 'Notification dispatched successfully', type: NotificationResponseDto })
  async triggerNotification(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.sendNotification(dto);
  }
}
