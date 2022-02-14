import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../posts/post.entity';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    post: Post,
    user: User,
  ): Promise<Comment> {
    return this.commentRepository.createComment(createCommentDto, post, user);
  }

  async getComments(postId: number): Promise<Comment[]> {
    return this.commentRepository.getComments(postId);
  }
}
