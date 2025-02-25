import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import { Comment } from 'src/comments/comment.entity';
import { RegistryHelper } from '../utils/registry.helper';
import { Connection } from 'typeorm';
import * as net from 'net'; // ✅ Import TCP client

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

    // ✅ Send notification to `tcp-server.ts` over TCP (instead of WebSocket)
    const client = new net.Socket();
    client.connect(4000, 'localhost', () => {
      const message = JSON.stringify({
        id: savedNotification.id,
        type: savedNotification.type,
        createdAt: savedNotification.createdAt,
        fromUser: {
          id: savedNotification.fromUser.id,
          username: savedNotification.fromUser.username,
          profileImage: savedNotification.fromUser.profileImage || '',
        },
        postTitle: savedNotification.postTitle || 'Unknown Post',
      });

      client.write(message); // ✅ Send notification over TCP
      client.end(); // ✅ Close the connection after sending
    });

    console.log('📡 Sent notification to TCP Server:', savedNotification);

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
      postTitle: notification.postTitle || 'Unknown Post', // ✅ Use `postTitle`
    }));
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
