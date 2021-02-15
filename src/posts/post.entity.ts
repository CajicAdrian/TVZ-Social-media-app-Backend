import { User } from 'src/auth/user.entity';
import { Image } from 'src/images/image.entity';
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
  @ManyToOne(() => User, (user) => user.posts, { eager: false })
  user: User;

  @OneToMany(() => Image, (image) => image.posts, { cascade: true })
  images: Image[];
}
