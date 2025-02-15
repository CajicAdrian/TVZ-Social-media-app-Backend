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
import { Like } from 'src/likes/like.entity';
import { Role } from './role.enum';
import { Notification } from 'src/notifications/notifications.entity';

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

  @Column({ default: 0.0 })
  pepper: string;

  @Column({ default: Role.USER })
  role: string;

  // ✅ Ensuring Image is deleted when User is deleted
  @OneToOne(() => Image, (image) => image.users, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images: Image;

  // ✅ Delete all Posts when User is deleted
  @OneToMany(() => Post, (post) => post.user, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  posts: Post[];

  // ✅ Delete all Comments when User is deleted
  @OneToMany(() => Comment, (comment) => comment.user, {
    eager: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  // ✅ Delete all Likes when User is deleted
  @OneToMany(() => Like, (like) => like.user, {
    eager: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  likes: Like[];

  // ✅ Delete all Notifications when User is deleted
  @OneToMany(() => Notification, (notification) => notification.user, {
    eager: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  notifications: Notification[];

  @Column({ nullable: true })
  bio: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  profileImage: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
