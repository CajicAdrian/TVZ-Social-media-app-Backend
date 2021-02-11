import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { Post } from './post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  async getPosts(filterDto: GetPostsFilterDto, user: User): Promise<Post[]> {
    const { search } = filterDto;
    const query = this.createQueryBuilder('post');

    query.where('post.userId = :userId', { userId: user.id });

    if (search) {
      query.andWhere(
        '(post.title LIKE :search OR post.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const posts = await query.getMany();
    return posts;
  }

  async createPost(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const { title, description } = createPostDto;
    const post = new Post();
    post.title = title;
    post.description = description;
    post.user = user;
    await post.save();

    delete post.user;

    return post;
  }
}
