import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import { Comment } from 'src/comments/comment.entity';
import { RegistryHelper } from '../utils/registry.helper';
import { Connection } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly connection: Connection, // ✅ Inject database connection
    @InjectRepository(NotificationsRepository)
    private notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(
    type: 'like' | 'comment' | 'like_comment', // ✅ Allow 'like_comment'
    user: User, // ✅ The user receiving the notification
    fromUser: User, // ✅ The user who performed the action
    post?: Post,
    comment?: Comment, // ✅ Add comment parameter
  ): Promise<Notification | null> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(); // ✅ Start transaction

    try {
      const settingKey =
        type === 'like' ? 'likeNotifications' : 'commentNotifications';
      const isEnabled = await RegistryHelper.getSetting(user.id, settingKey);

      if (isEnabled !== '1') {
        await queryRunner.rollbackTransaction();
        return null;
      }

      const existingNotification = await queryRunner.manager.findOne(
        Notification,
        {
          where: { type, user, fromUser, post, comment }, // ✅ Include `comment`
          lock: { mode: 'pessimistic_write' }, // ✅ Critical Section (Row Lock)
        },
      );

      if (existingNotification) {
        await queryRunner.rollbackTransaction();
        return null;
      }

      const notification = queryRunner.manager.create(Notification, {
        type,
        user,
        fromUser,
        post,
        comment, // ✅ Store the comment reference
        read: false,
      });

      await queryRunner.manager.save(notification);
      await queryRunner.commitTransaction(); // ✅ Commit if successful

      return notification;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async getNotificationsForUser(user: User): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user },
      relations: ['fromUser', 'post', 'comment'], // ✅ Ensure we fetch comments
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

  async getLikeNotification(
    user: User,
    post?: Post,
    comment?: Comment, // ✅ Allow comment lookup
  ): Promise<Notification | undefined> {
    return this.notificationsRepository.findOne({
      where: {
        type: post ? 'like' : 'like_comment',
        fromUser: user,
        post,
        comment,
      },
    });
  }

  async deleteLikeNotification(
    user: User,
    target: Post | Comment,
    type: 'post' | 'comment',
  ): Promise<void> {
    await this.notificationsRepository.delete({
      type: type === 'post' ? 'like' : 'like_comment',
      fromUser: { id: user.id },
      post: type === 'post' ? { id: (target as Post).id } : undefined,
      comment: type === 'comment' ? { id: (target as Comment).id } : undefined,
    });
  }
}
