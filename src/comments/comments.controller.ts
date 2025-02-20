import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { PostsService } from 'src/posts/posts.service';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('/posts/:postId/comments')
@UseGuards(AuthGuard())
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private postsService: PostsService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ): Promise<Comment> {
    const post = await this.postsService.getPostById(postId);
    return this.commentsService.createComment(createCommentDto, post, user);
  }

  @Get()
  async getComments(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    const comments = await this.commentsService.getComments(postId);

    return comments;
  }

  @Patch('/:commentId')
  @UsePipes(ValidationPipe)
  async updateComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ): Promise<Comment> {
    console.log(
      `📢 Updating Comment - PostID: ${postId}, CommentID: ${commentId}`,
    );
    return this.commentsService.updateComment(
      postId,
      commentId,
      updateCommentDto,
      user,
    );
  }

  @Delete('/:commentId')
  async deleteComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    console.log(
      `🗑️ Deleting Comment - PostID: ${postId}, CommentID: ${commentId}`,
    );
    return this.commentsService.deleteComment(postId, commentId, user);
  }
}
