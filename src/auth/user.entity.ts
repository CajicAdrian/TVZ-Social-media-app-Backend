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

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
