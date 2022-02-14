import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Post } from '../posts/post.entity';
import { Like } from './like.entity';
import { LikeRepository } from './like.repository';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository,
  ) {}

  async createLike(post: Post, user: User): Promise<Like> {
    return this.likeRepository.createLike(post, user);
  }

  async deleteLike(post: Post, user: User): Promise<void> {
    return this.likeRepository.deleteLike(post, user);
  }
}
