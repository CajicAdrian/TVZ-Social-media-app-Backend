import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
import { Like } from './like.entity';

@EntityRepository(Like)
export class LikeRepository extends Repository<Like> {
  constructor() {
    super();
  }

  async createLike(
    target: Post | Comment,
    user: User,
    type: 'post' | 'comment',
  ): Promise<Like> {
    const like = new Like();
    like.user = user;

    if (type === 'post' && target instanceof Post) {
      like.post = target;
    } else if (type === 'comment' && target instanceof Comment) {
      like.comment = target;
    } else {
      throw new Error(`Invalid target type: ${type}`);
    }

    await like.save();
    return like;
  }

  async deleteLike(target: Post | Comment, user: User): Promise<void> {
    let entityType = target instanceof Post ? 'postId' : 'commentId';

    await this.manager.query(
      `DELETE FROM "like" WHERE "${entityType}" = $1 AND "userId" = $2`,
      [target.id, user.id],
    );
  }
}
