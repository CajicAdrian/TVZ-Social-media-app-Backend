import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationsRepository)
    private notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(
    type: 'like' | 'comment',
    user: User,
    fromUser: User,
    post?: Post,
  ): Promise<Notification> {
    return this.notificationsRepository.createNotification(
      type,
      user,
      fromUser,
      post,
    );
  }

  async getNotificationsForUser(user: User): Promise<Notification[]> {
    const notifications = this.notificationsRepository.find({
      where: { user },
      relations: ['fromUser', 'post'],
      order: { createdAt: 'DESC' },
      take: 5,
    });
    return notifications;
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
}
