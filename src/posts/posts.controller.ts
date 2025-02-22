import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import type { Post as PostEntity } from './post.entity';
import { PostsService } from './posts.service';
import { Role } from 'src/auth/role.enum';

@Controller('posts')
@UseGuards(AuthGuard())
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getPosts(@GetUser() user: User) {
    return this.postsService.getPosts(user);
  }

  @Get('/:id')
  getPostById(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postsService.getPostById(id);
  }

  @Get('/user/:userId')
  async getPostsByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<PostEntity[]> {
    return this.postsService.getPostsByUser(userId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postsService.createPost(createPostDto, user);
  }

  @Patch('/:id')
  async updatePostById(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: EditPostDto,
    @GetUser() user: User,
  ): Promise<void> {
    const post = await this.getPostById(id);

    // ✅ Use `canUserEdit()` instead of manual role checking
    if (!post.canUserEdit(user)) {
      throw new ForbiddenException("You can't edit this post.");
    }

    return this.postsService.updatePostById(id, changes, user);
  }

  @Delete('/:id')
  async deletePostById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    const post = await this.getPostById(id);

    // ✅ Use `canUserDelete()` instead of manual role checking
    if (!post.canUserDelete(user)) {
      throw new ForbiddenException("You can't delete this post.");
    }

    return this.postsService.deletePostById(id, user);
  }
}
