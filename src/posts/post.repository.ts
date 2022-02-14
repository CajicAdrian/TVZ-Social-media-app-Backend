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
  async getPosts(user?: User): Promise<Post[]> {
    let query = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.images', 'images')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('post.commentCount', 'post.comments');

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

    return query.getMany();
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
