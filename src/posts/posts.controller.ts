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
import { CreatePostDto } from './dto/create-post.dto';
import type { Post as PostEntity } from './post.entity';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(AuthGuard())
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getPosts(): Promise<PostEntity[]> {
    return this.postsService.getPosts();
  }

  @Get('/:id')
  getPostById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postsService.getPostById(id, user);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postsService.createPost(createPostDto, user);
  }
}
