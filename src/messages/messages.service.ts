import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageRepository } from './messages.repository';
import { Message } from './messages.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageRepository)
    private readonly messageRepository: MessageRepository,
  ) {}

  async createMessage(
    senderId: number,
    receiverId: number,
    message: string,
  ): Promise<Message> {
    return this.messageRepository.createMessage(senderId, receiverId, message);
  }

  async getMessages(user1: number, user2: number): Promise<Message[]> {
    return this.messageRepository.findMessagesBetweenUsers(user1, user2);
  }
}
