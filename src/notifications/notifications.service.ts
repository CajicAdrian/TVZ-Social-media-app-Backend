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
    type: 'like' | 'comment' | 'like_comment',
    user: User,
    fromUser: User,
    post?: Post,
    comment?: Comment,
  ): Promise<Notification | null> {
    const settingKey =
      type === 'comment' ? 'commentNotifications' : 'likeNotifications';
    const isEnabled = await RegistryHelper.getSetting(user.id, settingKey);

    if (isEnabled !== '1') {
      return null; // ✅ Skip notification if user has disabled it
    }

    // ✅ Ensure `postTitle` is assigned per post (check only if the specific post has an existing notification)
    let postTitle: string | null = post?.title || null;

    if (post) {
      // ✅ Check if there is already a notification for *this* user and *this* post
      const existingNotification = await this.notificationsRepository.findOne({
        where: { user, post, type }, // ✅ Only check for this post, not all posts of the user
      });

      if (existingNotification) {
        postTitle = existingNotification.postTitle; // ✅ Use stored title for this post
      }
    }

    // ✅ Create new notification with the correct title
    const notification = this.notificationsRepository.create({
      type,
      user,
      fromUser,
      post,
      comment,
      postTitle, // ✅ Each post gets its own title
      read: false,
    });

    return this.notificationsRepository.save(notification);
  }

  async getNotificationsForUser(user: User): Promise<any[]> {
    const notifications = await this.notificationsRepository.find({
      where: { user },
      relations: ['fromUser', 'comment'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
      fromUser: {
        id: notification.fromUser.id,
        username: notification.fromUser.username,
        profileImage: notification.fromUser.profileImage || '',
      },
      postTitle: notification.postTitle || 'Unknown Post', // ✅ Use `postTitle`
    }));
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
