import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Post } from '../posts/post.entity';
import { Like } from './like.entity';
import { LikeRepository } from './like.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostRepository } from 'src/posts/post.repository';

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
    // Ensure the post includes the user
    const postWithUser = await this.postRepository.findOne(post.id, {
      relations: ['user'], // Ensure the user is loaded
    });

    if (!postWithUser?.user) {
      throw new Error('Post owner (user) not found');
    }

    // Create the like
    const like = await this.likeRepository.createLike(postWithUser, user);

    // Create a notification
    try {
      await this.notificationService.createNotification(
        'like',
        postWithUser.user,
        user,
        postWithUser,
      );
    } catch (err) {
      console.error('Failed to create notification:', err);
      // Optionally, log the error or handle it gracefully
    }
    return like;
  }

  async deleteLike(post: Post, user: User): Promise<void> {
    return this.likeRepository.deleteLike(post, user);
  }
}
