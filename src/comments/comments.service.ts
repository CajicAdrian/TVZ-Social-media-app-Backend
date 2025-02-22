import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../posts/post.entity';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostRepository } from 'src/posts/post.repository';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    private notificationsService: NotificationsService,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    post: Post,
    user: User,
  ): Promise<{ comment: Comment; commentCount: number }> {
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

    const updatedPost = await this.postRepository.findOne(post.id, {
      relations: ['comments'], // Ensure we get updated comments count
    });

    return { comment, commentCount: updatedPost?.commentCount || 0 };
  }

  async getComments(postId: number, user: User): Promise<any[]> {
    return this.commentRepository.getComments(postId, user); // ✅ Now includes like data
  }

  async updateComment(
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<Comment> {
    console.log(
      `🔍 Looking for CommentID: ${commentId} under PostID: ${postId}`,
    );

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['post', 'user'],
    });

    if (!comment) {
      console.log(`❌ Comment ID ${commentId} not found!`);
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.post.id !== postId) {
      console.log(`❌ Comment ${commentId} does NOT belong to Post ${postId}`);
      throw new NotFoundException(
        `Comment ${commentId} does not belong to post ${postId}`,
      );
    }

    if (comment.user.id !== user.id) {
      console.log(`❌ User ${user.id} is not authorized to edit this comment`);
      throw new ForbiddenException('You can only edit your own comments');
    }

    console.log(`✅ Found comment, updating content...`);
    comment.content = updateCommentDto.content;
    comment.updatedAt = new Date();
    await this.commentRepository.save(comment);

    console.log(`✅ Successfully updated comment ID: ${commentId}`);
    return comment;
  }

  async deleteComment(
    postId: number,
    commentId: number,
    user: User,
  ): Promise<{ message: string; commentCount: number }> {
    console.log(
      `🗑️ Attempting to delete CommentID: ${commentId} under PostID: ${postId}`,
    );

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['post', 'user'],
    });

    if (!comment) {
      console.log(`❌ Comment ID ${commentId} not found!`);
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.post.id !== postId) {
      console.log(`❌ Comment ${commentId} does NOT belong to Post ${postId}`);
      throw new NotFoundException(
        `Comment ${commentId} does not belong to post ${postId}`,
      );
    }

    if (comment.user.id !== user.id) {
      console.log(
        `❌ User ${user.id} is not authorized to delete this comment`,
      );
      throw new ForbiddenException('You can only delete your own comments');
    }

    console.log(`✅ Comment found, deleting...`);
    await this.commentRepository.remove(comment);

    // ✅ Fetch updated comment count after deletion
    const updatedPost = await this.postRepository.findOne(postId, {
      relations: ['comments'], // Ensure we get updated comments count
    });

    console.log(`✅ Successfully deleted comment ID: ${commentId}`);

    return {
      message: 'Comment deleted successfully',
      commentCount: updatedPost?.commentCount || 0,
    };
  }

  async getCommentById(commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.getCommentById(commentId);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    return comment;
  }
}
