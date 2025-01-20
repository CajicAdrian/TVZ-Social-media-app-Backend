import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    type: 'like' | 'comment' | 'follow',
    user: User,
    fromUser: User,
    post?: Post,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type,
      user,
      fromUser,
      post: post || null,
    });
    return this.notificationRepository.save(notification);
  }

  async getNotificationsForUser(user: User): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number, user: User): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    await this.notificationRepository.save(notification);
  }
}
