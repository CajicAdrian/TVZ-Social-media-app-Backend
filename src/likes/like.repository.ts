import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Like } from './like.entity';

@EntityRepository(Like)
export class LikeRepository extends Repository<Like> {
  constructor() {
    super();
  }

  async createLike(post: Post, user: User): Promise<Like> {
    const like = new Like();
    like.user = user;
    like.post = post;

    await like.save();

    delete like.user;
    delete like.post;

    return like;
  }

  async deleteLike(post: Post, user: User): Promise<void> {
    await this.manager.query(
      `
      DELETE FROM "like"
      WHERE "postId" = $1 AND "userId" = $2
    `,
      [post.id, user.id],
    );
  }
}
