import { User } from 'src/auth/user.entity';
import { Like } from 'src/likes/like.entity';
import { Notification } from 'src/notifications/notifications.entity';
import { Post } from 'src/posts/post.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: false })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { eager: false })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Like, (like) => like.comment, { cascade: true })
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.comment, {
    cascade: true,
    nullable: true,
  })
  notifications: Notification[];

  likeCount(): number {
    return this.likes ? this.likes.length : 0;
  }

  isLikedByUser(user: User): boolean {
    return this.likes
      ? this.likes.some((like) => like.user.id === user.id)
      : false;
  }
}
