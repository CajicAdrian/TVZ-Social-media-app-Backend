import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
  OneToOne,
} from 'typeorm';

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  imageId: number;

  @Column()
  filePath: string;

  @Column()
  fileName: string;

  @JoinTable()
  @OneToOne(() => User, (user) => user.images, { onDelete: 'CASCADE' })
  users: User;

  @JoinTable()
  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  posts: Post;
}
