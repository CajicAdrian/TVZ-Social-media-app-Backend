import { EntityRepository, Repository } from 'typeorm';
import { Message } from './messages.entity';

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  async createMessage(
    senderId: number,
    receiverId: number,
    message: string,
  ): Promise<Message> {
    const newMessage = this.create({ senderId, receiverId, message });
    return this.save(newMessage);
  }

  async findMessagesBetweenUsers(
    user1: number,
    user2: number,
  ): Promise<Message[]> {
    return this.createQueryBuilder('message')
      .where('(message.senderId = :user1 AND message.receiverId = :user2)', {
        user1,
        user2,
      })
      .orWhere('(message.senderId = :user2 AND message.receiverId = :user1)', {
        user1,
        user2,
      })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }
}
