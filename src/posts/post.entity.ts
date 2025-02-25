import { Expose } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Comment } from 'src/comments/comment.entity';
import { Image } from 'src/images/image.entity';
import { Like } from 'src/likes/like.entity';
import { Notification } from 'src/notifications/notifications.entity';

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
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

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  @Expose()
  get commentCount(): number {
    return this.comments?.length || 0;
  }

  @OneToMany(() => Like, (like) => like.post, { cascade: true })
  likes: Like[];

  @OneToMany(() => Image, (image) => image.posts, { cascade: true })
  images: Image[];

  @OneToMany(() => Notification, (notification) => notification.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  notifications: Notification[];

  canUserEdit(user: User): boolean {
    return user.isAdmin() || this.user.id === user.id;
  }

  canUserDelete(user: User): boolean {
    return user.isAdmin() || this.user.id === user.id;
  }
}
