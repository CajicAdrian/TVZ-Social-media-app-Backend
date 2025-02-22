import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
import { Like } from './like.entity';
import { LikeRepository } from './like.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostRepository } from 'src/posts/post.repository';
import { CommentRepository } from 'src/comments/comment.repository';
import { RegistryHelper } from '../utils/registry.helper';

@Injectable()
export class LikesService {
  constructor(
    private notificationService: NotificationsService,
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository,
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
  ) {}

  async createLike(
    targetId: number,
    user: User,
    type: 'post' | 'comment',
  ): Promise<Like> {
    let target: Post | Comment | null = null;

    if (type === 'post') {
      target = await this.postRepository.findOne(targetId, {
        relations: ['user'],
      });
    } else {
      target = await this.commentRepository.findOne(targetId, {
        relations: ['user'],
      });
    }

    if (!target) {
      throw new Error(`${type} not found`);
    }

    // ✅ Fix: Ensure correct relation when checking existing likes
    const existingLike = await this.likeRepository.findOne({
      where: { user, [type]: target },
    });

    if (existingLike) {
      return existingLike; // Prevent duplicate likes
    }

    // ✅ Fix: Pass `type` to `createLike`
    const like = await this.likeRepository.createLike(target, user, type);

    // ✅ Fetch notification setting
    const likeNotificationsEnabled = await RegistryHelper.getSetting(
      target.user.id,
      'likeNotifications',
    );

    // ✅ Fix: Ensure `post` or `comment` is passed separately
    if (likeNotificationsEnabled === '1') {
      if (type === 'post') {
        await this.notificationService.createNotification(
          'like',
          target.user,
          user,
          target as Post,
          undefined, // No comment
        );
      } else {
        await this.notificationService.createNotification(
          'like_comment', // New type for comment likes
          target.user,
          user,
          undefined, // No post
          target as Comment,
        );
      }
    }

    return like;
  }

  async deleteLike(
    target: Post | Comment,
    user: User,
    type: 'post' | 'comment',
  ): Promise<void> {
    await this.likeRepository.deleteLike(target, user);

    await this.notificationService.deleteLikeNotification(user, target, type);
  }
}
