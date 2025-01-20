import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Post } from '../posts/post.entity';
import { Like } from './like.entity';
import { LikeRepository } from './like.repository';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private notificationService: NotificationsService,
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository,
  ) {}

  async createLike(post: Post, user: User): Promise<Like> {
    const like = await this.likeRepository.createLike(post, user);

    await this.notificationService.createNotification(
      'like',
      post.user,
      user,
      post,
    );
    return like;
  }

  async deleteLike(post: Post, user: User): Promise<void> {
    return this.likeRepository.deleteLike(post, user);
  }
}
