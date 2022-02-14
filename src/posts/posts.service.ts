import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { ImageRepository } from 'src/images/image.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { Post } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    @InjectRepository(ImageRepository) private imageRepository: ImageRepository,
  ) {}

  async getPosts(user: User): Promise<Post[]> {
    return this.postRepository.getPosts(user);
  }

  async getPostById(id: number): Promise<Post> {
    const found = await this.postRepository.findOne(id, {
      relations: ['user', 'images'],
    });

    if (!found) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    return found;
  }

  async getCommentIds(id: number): Promise<number[]> {
    return this.postRepository.getCommentIds(id);
  }

  async createPost(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const images = [await this.imageRepository.findOne(createPostDto.imageId)];
    return this.postRepository.createPost(createPostDto, user, images);
  }

  async updatePostById(
    id: number,
    user: User,
    changes: EditPostDto,
  ): Promise<void> {
    const post = await this.getPostById(id);

    if (post.user.id !== user.id) {
      throw new ForbiddenException("Cannot edit other user's posts");
    }

    await this.postRepository.update(id, changes);
  }

  async deletePostById(id: number, user: User): Promise<void> {
    const post = await this.getPostById(id);

    if (post.user.id !== user.id) {
      throw new ForbiddenException("Cannot delete other user's posts");
    }

    await this.postRepository.manager.query(
      'DELETE FROM "comment" WHERE "postId" = $1',
      [post.id],
    );
    await this.postRepository.manager.query(
      'DELETE FROM "like" WHERE "postId" = $1',
      [post.id],
    );
    await Promise.all(
      post.images.map((img) => this.imageRepository.delete(img.imageId)),
    );
    await this.postRepository.delete(id);
  }
}
