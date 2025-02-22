import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { LikesService } from './likes.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsService } from 'src/posts/posts.service';
import { CommentsService } from 'src/comments/comments.service';

@Controller('/likes')
@UseGuards(AuthGuard())
export class LikesController {
  constructor(
    private likesService: LikesService,
    private postsService: PostsService, // ✅ Inject PostsService
    private commentsService: CommentsService,
  ) {}

  @Post('/post/:postId')
  @UsePipes(ValidationPipe)
  async likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ) {
    return this.likesService.createLike(postId, user, 'post');
  }

  @Post('/comments/:commentId')
  @UsePipes(ValidationPipe)
  async likeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: User,
  ) {
    const comment = await this.commentsService.getCommentById(commentId); // ✅ Fetch comment
    return this.likesService.createLike(commentId, user, 'comment');
  }

  @Delete('/posts/:postId')
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ): Promise<void> {
    const post = await this.postsService.getPostById(postId);
    return this.likesService.deleteLike(post, user, 'post');
  }

  @Delete('/comments/:commentId')
  async unlikeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: User,
  ): Promise<void> {
    const comment = await this.commentsService.getCommentById(commentId); // ✅ Fetch comment
    return this.likesService.deleteLike(comment, user, 'comment'); // ✅ Pass the full comment object
  }
}
