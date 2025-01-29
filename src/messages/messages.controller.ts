import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { MessageService } from './messages.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @Body('message') message: string,
  ) {
    return this.messageService.createMessage(senderId, receiverId, message);
  }

  @Get()
  async getMessages(
    @Query('user1') user1: number,
    @Query('user2') user2: number,
  ) {
    return this.messageService.getMessages(user1, user2);
  }
}
