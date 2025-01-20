import { User } from 'src/auth/user.entity';
import { Post } from 'src/posts/post.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['like', 'comment', 'follow'] })
  type: 'like' | 'comment' | 'follow';

  @ManyToOne(() => User, (user) => user.notifications, { eager: false })
  user: User; // Recipient of the notification

  @ManyToOne(() => User, { eager: true })
  fromUser: User; // User who triggered the notification

  @ManyToOne(() => Post, { nullable: true, eager: true })
  post: Post; // Post related to the notification (optional)

  @Column({ default: false })
  read: boolean; // Indicates if the notification has been read

  @CreateDateColumn()
  createdAt: Date; // Timestamp for when the notification was created
}
