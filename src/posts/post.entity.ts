import { User } from 'src/auth/user.entity';
import { Comment } from 'src/comments/comment.entity';
import { Image } from 'src/images/image.entity';
import { Like } from 'src/likes/like.entity';
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

  @JoinTable()
  @OneToMany(() => Like, (like) => like.post, { cascade: true })
  likes: Like[];

  @OneToMany(() => Image, (image) => image.posts, { cascade: true })
  images: Image[];
}
