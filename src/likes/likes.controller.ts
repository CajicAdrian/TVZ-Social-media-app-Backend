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
import { PostsService } from 'src/posts/posts.service';
import { Like } from './like.entity';
import { LikesService } from './likes.service';

@Controller('/posts/:postId/likes')
@UseGuards(AuthGuard())
export class LikesController {
  constructor(
    private likesService: LikesService,
    private postsService: PostsService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createLike(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ): Promise<Like> {
    const post = await this.postsService.getPostById(postId);
    return this.likesService.createLike(post, user);
  }

  @Delete()
  @UsePipes(ValidationPipe)
  async deleteLike(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ): Promise<void> {
    const post = await this.postsService.getPostById(postId);
    return this.likesService.deleteLike(post, user);
  }
}
