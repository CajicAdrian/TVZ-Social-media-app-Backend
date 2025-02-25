import { EntityRepository, Repository } from 'typeorm';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import { Comment } from 'src/comments/comment.entity';

@EntityRepository(Notification)
export class NotificationsRepository extends Repository<Notification> {
  async createNotification(
    type: 'like' | 'comment' | 'like_comment',
    user: User,
    fromUser: User,
    post?: Post,
    comment?: Comment,
  ): Promise<Notification> {
    const notification = this.create({
      type,
      user,
      fromUser,
      comment: comment || null,
      postTitle: post ? post.title : null,
    });
    return this.save(notification);
  }
}
