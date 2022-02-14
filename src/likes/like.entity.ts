import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import {
  BaseEntity,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinTable()
  @ManyToOne(() => User, (user) => user.likes, { eager: true })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, { eager: false })
  post: Post;
}
