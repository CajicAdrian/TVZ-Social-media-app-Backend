import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Post } from 'src/posts/post.entity';
import { Image } from 'src/images/image.entity';
import { Comment } from 'src/comments/comment.entity';

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @OneToOne(() => Image, (image) => image.users)
  images: Image;

  @OneToMany(() => Post, (post) => post.user, { eager: true })
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user, { eager: false })
  comments: Comment[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
