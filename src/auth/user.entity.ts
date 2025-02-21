import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  OneToOne,
} from 'typeorm';
import { createHash } from 'crypto';
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

  @Column('text', { array: true, default: {} })
  passwords: string[];

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
    if (!this.passwords || this.passwords.length === 0) {
      return false; // No password history available
    }

    // 🔍 Generate dynamic salt (same rule as sign-up)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const dynamicSalt = createHash('sha256')
      .update(this.username + timestamp)
      .digest('hex');

    // 🔍 Retrieve list of possible peppers from .env
    const possiblePeppers = process.env.PEPPER_VALUES?.split(',') || [];
    if (!possiblePeppers.length) {
      throw new Error('Server misconfiguration: No valid pepper found');
    }

    // 🔐 Try all possible peppers to match one of the stored passwords
    for (const pepper of possiblePeppers) {
      const hashedInputPassword = createHash('sha256')
        .update(password + pepper + dynamicSalt)
        .digest('hex');

      if (this.passwords.includes(hashedInputPassword)) {
        return true; // ✅ Password is correct
      }
    }

    return false; // ❌ No match found
  }
}
