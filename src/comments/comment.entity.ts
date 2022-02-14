import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @JoinTable()
  @ManyToOne(() => User, (user) => user.comments, { eager: false })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { eager: false })
  post: Post;
}
