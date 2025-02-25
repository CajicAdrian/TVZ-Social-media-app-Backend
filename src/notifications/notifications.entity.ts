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
import { Comment } from 'src/comments/comment.entity';

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['like', 'comment', 'like_comment'],
    nullable: false,
  })
  type: 'like' | 'comment' | 'like_comment';

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  fromUser: User;

  @ManyToOne(() => Post, (post) => post.notifications, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  post?: Post;

  @Column({ nullable: true })
  postTitle: string;

  @ManyToOne(() => Comment, (comment) => comment.notifications, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @CreateDateColumn()
  createdAt: Date;
}
