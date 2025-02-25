import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';

@Entity('messages')
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column('text')
  encryptedMessage: string;

  @Column('varchar', { length: 32 }) // ✅ AES IV
  iv: string;

  @Column('text')
  encryptedAESKey: string;

  @Column()
  senderSignature: string;

  @Column({ nullable: true })
  recipientSignature?: string;

  @CreateDateColumn()
  createdAt: Date;
}
