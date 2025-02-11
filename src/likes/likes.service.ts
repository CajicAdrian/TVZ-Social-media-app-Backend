import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Post } from '../posts/post.entity';
import { Like } from './like.entity';
import { LikeRepository } from './like.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostRepository } from 'src/posts/post.repository';
import { RegistryHelper } from '../utils/registry.helper';

@Injectable()
export class LikesService {
  constructor(
    private notificationService: NotificationsService,
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository,
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
  ) {}

  async createLike(post: Post, user: User): Promise<Like> {
    // ✅ Ensure the post includes the user (post owner)
    const postWithUser = await this.postRepository.findOne(post.id, {
      relations: ['user'],
    });

    if (!postWithUser?.user) {
      throw new Error('Post owner (user) not found');
    }

    // ✅ Check if the user already liked the post
    const existingLike = await this.likeRepository.findOne({
      where: { user, post },
    });

    if (existingLike) {
      return existingLike; // ✅ Prevent duplicate likes
    }

    // ✅ Create the like
    const like = await this.likeRepository.createLike(postWithUser, user);

    // ✅ Check if like notifications are enabled for the post owner
    const likeNotificationsEnabled = await RegistryHelper.getSetting(
      postWithUser.user.id,
      'likeNotifications',
    );

    console.log(
      `🔍 Checking Like Notifications for user ${postWithUser.user.id}:`,
      likeNotificationsEnabled,
    );

    // ❌ If notifications are disabled, do NOT send a like notification
    if (likeNotificationsEnabled !== '1') {
      console.log(
        `❌ Like notifications are disabled for user ${postWithUser.user.id}. Skipping notification.`,
      );
      return like;
    }

    // ✅ Check if a like notification already exists for this user & post
    const existingNotification = await this.notificationService.getLikeNotification(
      user,
      post,
    );

    if (!existingNotification) {
      // ✅ Create a notification only if it doesn't exist and is enabled
      await this.notificationService.createNotification(
        'like',
        postWithUser.user,
        user,
        postWithUser,
      );
    }

    return like;
  }

  async deleteLike(post: Post, user: User): Promise<void> {
    // ✅ Remove the like
    await this.likeRepository.deleteLike(post, user);

    // ✅ Remove ONLY this user's like notification for this post
    await this.notificationService.deleteLikeNotification(user, post);
  }
}
