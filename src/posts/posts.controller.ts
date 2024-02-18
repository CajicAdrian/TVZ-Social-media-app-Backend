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
    if (
      user.role === Role.ADMIN ||
      (post.user.id === user.id && user.role === Role.USER)
    ) {
      return this.postsService.updatePostById(id, changes);
    } else {
      throw new ForbiddenException("Cannot edit other user's posts");
    }
  }

  @Delete('/:id')
  async deletePostById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    const post = await this.getPostById(id);

    if (
      user.role === Role.ADMIN ||
      (post.user.id === user.id && user.role === Role.USER)
    ) {
      return this.postsService.deletePostById(id);
    } else {
      throw new ForbiddenException("Cannot delete other user's posts");
    }
  }
}
