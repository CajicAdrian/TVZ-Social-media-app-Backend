import { Expose } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Comment } from 'src/comments/comment.entity';
import { Image } from 'src/images/image.entity';
import { Like } from 'src/likes/like.entity';
import { Notification } from 'src/notifications/notifications.entity';

import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @JoinTable()
  @ManyToOne(() => User, (user) => user.posts, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @JoinTable()
  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  @Expose()
  get commentCount(): number {
    return this.comments?.length || 0;
  }

  @JoinTable()
  @OneToMany(() => Like, (like) => like.post, { cascade: true })
  likes: Like[];

  @OneToMany(() => Image, (image) => image.posts, { cascade: true })
  images: Image[];

  @OneToMany(() => Notification, (notification) => notification.post, {
    cascade: true, // ✅ Ensures notifications are deleted with the post
    onDelete: 'CASCADE', // ✅ Deletes all notifications when the post is deleted
  })
  notifications: Notification[];

  canUserEdit(user: User): boolean {
    return user.isAdmin() || this.user.id === user.id;
  }

  // ✅ Check if a user can delete this post
  canUserDelete(user: User): boolean {
    return user.isAdmin() || this.user.id === user.id;
  }
}
