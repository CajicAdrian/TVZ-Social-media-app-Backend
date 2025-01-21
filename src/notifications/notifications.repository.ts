import { EntityRepository, Repository } from 'typeorm';
import { Notification } from './notifications.entity';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';

@EntityRepository(Notification)
export class NotificationsRepository extends Repository<Notification> {
  async createNotification(
    type: 'like' | 'comment',
    user: User,
    fromUser: User,
    post?: Post,
  ): Promise<Notification> {
    const notification = this.create({
      type,
      user,
      fromUser,
      post: post || null,
    });
    return this.save(notification);
  }
}
