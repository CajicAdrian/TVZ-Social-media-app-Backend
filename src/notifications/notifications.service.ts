import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import { Comment } from 'src/comments/comment.entity';
import { RegistryHelper } from '../utils/registry.helper';
import { Connection } from 'typeorm';
import * as net from 'net';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(NotificationsRepository)
    private notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(
    type: 'like' | 'comment' | 'like_comment',
    user: User, // ❌ This might still be wrong!
    fromUser: User,
    post?: Post,
    comment?: Comment,
  ): Promise<Notification | null> {
    if (!user || !fromUser) {
      return null;
    }

    if (user.id === fromUser.id) {
      return null;
    }

    const settingKey =
      type === 'comment' ? 'commentNotifications' : 'likeNotifications';
    const isEnabled = await RegistryHelper.getSetting(user.id, settingKey);

    if (isEnabled !== '1') {
      return null;
    }

    let postTitle: string | null = post?.title || null;

    if (post) {
      const existingNotification = await this.notificationsRepository.findOne({
        where: { user, post, type },
      });

      if (existingNotification) {
        postTitle = existingNotification.postTitle;
      }
    }

    const notification = this.notificationsRepository.create({
      type,
      user,
      fromUser,
      post,
      comment,
      postTitle,
    });
    const savedNotification = await this.notificationsRepository.save(
      notification,
    );

    return savedNotification;
  }

  async getNotificationsForUser(userId: number): Promise<any[]> {
    const notifications = await this.notificationsRepository.find({
      where: { user: { id: userId } },
      relations: ['fromUser', 'comment'],
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'type', 'postTitle', 'createdAt'],
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      createdAt: notification.createdAt,
      fromUser: {
        id: notification.fromUser.id,
        username: notification.fromUser.username,
        profileImage: notification.fromUser.profileImage || '',
      },
      postTitle: notification.postTitle || 'Unknown Post',
    }));
  }

  async getLikeNotification(
    user: User,
    post?: Post,
    comment?: Comment,
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
