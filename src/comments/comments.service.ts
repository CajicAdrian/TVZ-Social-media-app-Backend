import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../posts/post.entity';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
    private notificationsService: NotificationsService,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    post: Post,
    user: User,
  ): Promise<Comment> {
    const comment = await this.commentRepository.createComment(
      createCommentDto,
      post,
      user,
    );

    // Trigger notification for the comment
    await this.notificationsService.createNotification(
      'comment',
      post.user,
      user,
      post,
    );

    return comment;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return this.commentRepository.getComments(postId);
  }
}
