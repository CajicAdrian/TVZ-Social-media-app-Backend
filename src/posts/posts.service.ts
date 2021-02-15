import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { ImageRepository } from 'src/images/image.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { Post } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    @InjectRepository(ImageRepository) private imageRepository: ImageRepository,
  ) {}

  async getPosts(filterDto: GetPostsFilterDto, user: User): Promise<Post[]> {
    return this.postRepository.getPosts(filterDto, user);
  }

  async getPostById(id: number, user: User): Promise<Post> {
    const found = await this.postRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    return found;
  }

  async createPost(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const images = [await this.imageRepository.findOne(createPostDto.imageId)];
    return this.postRepository.createPost(createPostDto, user, images);
  }
}
