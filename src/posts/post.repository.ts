import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Image } from 'src/images/image.entity';
import { ImageRepository } from 'src/images/image.repository';
import { EntityRepository, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { Post } from './post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  constructor(
    @InjectRepository(ImageRepository) private imageRepository: ImageRepository,
  ) {
    super();
  }
  async getPosts(filterDto: GetPostsFilterDto, user: User): Promise<Post[]> {
    const { search } = filterDto;
    const query = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.images', 'images')
      .getMany();
    return query;
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
