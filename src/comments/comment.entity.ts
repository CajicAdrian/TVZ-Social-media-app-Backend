import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: false }) // ✅ Ensure relation
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { eager: false })
  post: Post;

  @CreateDateColumn()
  createdAt: Date; // ✅ Store comment timestamp

  @UpdateDateColumn()
  updatedAt: Date;
}
