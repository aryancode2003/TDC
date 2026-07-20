import { NotificationsService } from './notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: any;
  let userRepo: any;

  const mockNotificationRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    findByUserId: jest.fn(),
    findUnreadByUserId: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    notificationRepo = mockNotificationRepo;
    userRepo = mockUserRepo;

    service = new NotificationsService(notificationRepo, userRepo as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.sendNotification({
          userId: 'user-123',
          type: 'alert',
          title: 'Alert',
          description: 'A message',
          channel: 'push',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should save and dispatch push notification successfully', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-123' });
      const mockNotif = {
        id: 'notif-123',
        userId: 'user-123',
        title: 'Alert',
        description: 'A message',
        channel: 'push',
        isSent: false,
      };
      notificationRepo.create.mockReturnValue(mockNotif);
      notificationRepo.save.mockImplementation(async (notif: any) => notif);

      const result = await service.sendNotification({
        userId: 'user-123',
        type: 'alert',
        title: 'Alert',
        description: 'A message',
        channel: 'push',
      });

      expect(result.isSent).toBe(true);
      expect(notificationRepo.save).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should throw NotFoundException if notification does not exist', async () => {
      notificationRepo.findOne.mockResolvedValue(null);
      await expect(service.markAsRead('user-123', 'notif-123')).rejects.toThrow(NotFoundException);
    });

    it('should set isRead to true if not already read', async () => {
      const mockNotif = {
        id: 'notif-123',
        userId: 'user-123',
        isRead: false,
      };
      notificationRepo.findOne.mockResolvedValue(mockNotif);
      notificationRepo.save.mockResolvedValue(mockNotif);

      const result = await service.markAsRead('user-123', 'notif-123');
      expect(result.isRead).toBe(true);
      expect(notificationRepo.save).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should set isRead to true for all unread notifications of user', async () => {
      const mockUnread = [
        { id: 'notif-1', userId: 'user-123', isRead: false },
        { id: 'notif-2', userId: 'user-123', isRead: false },
      ];
      notificationRepo.find.mockResolvedValue(mockUnread);

      await service.markAllAsRead('user-123');

      expect(mockUnread[0].isRead).toBe(true);
      expect(mockUnread[1].isRead).toBe(true);
      expect(notificationRepo.save).toHaveBeenCalledWith(mockUnread);
    });
  });

  describe('deleteNotification', () => {
    it('should throw NotFoundException if notification not found', async () => {
      notificationRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteNotification('user-123', 'notif-123')).rejects.toThrow(NotFoundException);
    });

    it('should delete notification from repository', async () => {
      const mockNotif = { id: 'notif-123', userId: 'user-123' };
      notificationRepo.findOne.mockResolvedValue(mockNotif);

      await service.deleteNotification('user-123', 'notif-123');

      expect(notificationRepo.remove).toHaveBeenCalledWith(mockNotif);
    });
  });
});
