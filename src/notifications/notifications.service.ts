import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import { RegistryHelper } from '../utils/registry.helper';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationsRepository)
    private notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(
    type: 'like' | 'comment',
    user: User, // ✅ The user receiving the notification
    fromUser: User, // ✅ The user who performed the action
    post?: Post,
  ): Promise<Notification | null> {
    try {
      // ✅ Fetch user's notification preference from Windows Registry
      const settingKey =
        type === 'like' ? 'likeNotifications' : 'commentNotifications';
      const isEnabled = await RegistryHelper.getSetting(user.id, settingKey);

      console.log(
        `🔍 Checking ${type} notifications for user ${user.id}:`,
        isEnabled,
      );

      // ❌ If notifications are disabled, do NOT create a notification
      if (isEnabled !== '1') {
        console.log(
          `❌ ${type} notifications are disabled for user ${user.id}. Skipping notification.`,
        );
        return null;
      }

      // ✅ Create the notification since it's enabled
      return this.notificationsRepository.createNotification(
        type,
        user,
        fromUser,
        post,
      );
    } catch (error) {
      console.error(
        `❌ Failed to check notification settings for user ${user.id}:`,
        error,
      );
      return null; // ❌ Prevents sending notifications if an error occurs
    }
  }

  async getNotificationsForUser(user: User): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user },
      relations: ['fromUser', 'post'],
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  async markAsRead(notificationId: number, user: User): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, user },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    await this.notificationsRepository.save(notification);
  }

  /**
   * ✅ NEW METHOD: Check if a like notification exists for a user on a specific post
   */
  async getLikeNotification(
    user: User,
    post: Post,
  ): Promise<Notification | undefined> {
    return this.notificationsRepository.findOne({
      where: { type: 'like', fromUser: user, post },
    });
  }

  /**
   * ✅ NEW METHOD: Delete only the like notification for the specific user
   */
  async deleteLikeNotification(user: User, post: Post): Promise<void> {
    await this.notificationsRepository.delete({
      type: 'like',
      fromUser: { id: user.id },
      post: { id: post.id },
    });
  }
}
