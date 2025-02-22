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
import { Role } from 'src/auth/role.enum';
import { Image } from 'src/images/image.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    @InjectRepository(ImageRepository) private imageRepository: ImageRepository,
  ) {}

  async getPosts(user: User): Promise<Post[]> {
    const transformedPosts = await this.postRepository.getPosts(user);
    return transformedPosts as any; // ✅ TypeScript no longer complains
  }

  async getPostById(id: number): Promise<Post> {
    const found = await this.postRepository.findOne(id, {
      relations: ['user', 'images', 'comments'],
    });

    if (!found) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    return found;
  }

  async getPostsByUser(
    userId: number,
  ): Promise<
    Array<{
      id: number;
      title: string;
      description: string;
      username: string;
      profileImage?: string;
      images: Image[];
      likeCount: number;
      commentCount: number;
      likedByCurrentUser?: boolean;
    }>
  > {
    return this.postRepository.getPostsByUser(userId);
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
    changes: EditPostDto,
    user: User,
  ): Promise<void> {
    const post = await this.getPostById(id);

    if (!post.canUserEdit(user)) {
      throw new ForbiddenException("You can't edit this post.");
    }

    await this.postRepository.update(id, changes);
  }

  async deletePostById(id: number, user: User): Promise<void> {
    const post = await this.getPostById(id);

    if (!post.canUserDelete(user)) {
      throw new ForbiddenException("You can't delete this post.");
    }

    await this.postRepository.manager.query(
      'DELETE FROM "notification" WHERE "postId" = $1',
      [id],
    );
    await this.postRepository.manager.query(
      'DELETE FROM "comment" WHERE "postId" = $1',
      [id],
    );
    await this.postRepository.manager.query(
      'DELETE FROM "like" WHERE "postId" = $1',
      [id],
    );
    await Promise.all(
      post.images.map((img) => this.imageRepository.delete(img.imageId)),
    );

    await this.postRepository.delete(id);
  }
}
