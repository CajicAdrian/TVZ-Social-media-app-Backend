import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['like', 'comment'], nullable: false })
  type: 'like' | 'comment'; // Add 'comment' type here

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  fromUser: User;

  @ManyToOne(() => Post, { nullable: true })
  post: Post;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
