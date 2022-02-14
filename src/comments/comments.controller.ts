import {
  Body,
  Controller,
  Get,
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
import { PostsService } from 'src/posts/posts.service';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

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
}
