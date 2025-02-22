import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Image } from 'src/images/image.entity';
import { ImageRepository } from 'src/images/image.repository';
import { EntityRepository, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './post.entity';

@Injectable()
@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  constructor(
    @InjectRepository(ImageRepository) private imageRepository: ImageRepository,
  ) {
    super();
  }
  async getPosts(
    user?: User,
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
    let query = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.user', 'user') // ✅ Ensure user relation is joined
      .addSelect(['user.profileImage', 'user.username']) // ✅ Extract profileImage & username
      .leftJoinAndSelect('post.comments', 'comments') // ✅ This makes sure `commentCount` works
      .loadRelationCountAndMap('post.likeCount', 'post.likes'); // ✅ Dynamically count likes

    if (user) {
      query = query.loadRelationCountAndMap(
        'post.likedByCurrentUser',
        'post.likes',
        'ourLike',
        (qb) => {
          return qb.andWhere('ourLike.userId = :ourUser', { ourUser: user.id });
        },
      );
    }

    const posts = await query.getMany();

    // ✅ Explicitly map dynamic properties to avoid type issues
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      username: post.user?.username || 'Unknown',
      profileImage: post.user?.profileImage || '', // Ensures an empty string instead of undefined
      images: post.images || [], // Ensure it's always an array
      likeCount: (post as any).likeCount || 0, // ✅ Ensure these exist
      commentCount: post.commentCount || 0, // ✅ Ensure these exist
      likedByCurrentUser: (post as any).likedByCurrentUser ?? false, // ✅ Ensure boolean is always present
    }));
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
    const posts = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.user', 'user')
      .addSelect(['user.username', 'user.profileImage']) // ✅ Ensure profileImage is selected
      .where('post.userId = :userId', { userId })
      .leftJoinAndSelect('post.comments', 'comments') // ✅ This makes sure `commentCount` works
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap(
        'post.likedByCurrentUser',
        'post.likes',
        'ourLike',
        (qb) => qb.andWhere('ourLike.userId = :userId', { userId }),
      )
      .getMany();

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      username: post.user.username,
      profileImage: post.user.profileImage, // ✅ This ensures profile image is included
      images: post.images,
      likeCount: (post as any).likeCount || 0, // ✅ Ensure these exist
      commentCount: post.commentCount || 0, // ✅ Ensure these exist
      likedByCurrentUser: (post as any).likedByCurrentUser ?? false,
    }));
  }

  async getCommentIds(id: number): Promise<number[]> {
    const post = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'post.comments')
      .where({ id })
      .getOne();

    return post.comments.map((comment) => comment.id);
  }

  async createPost(
    createPostDto: CreatePostDto,
    user: User,
    images: Image[],
  ): Promise<Post> {
    const { title, description } = createPostDto;
    const post = new Post();
    post.title = title;
    post.description = description;
    post.user = user;
    post.images = images;
    await post.save();

    delete post.user;

    return post;
  }
}
