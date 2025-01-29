import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageRepository } from './messages.repository';
import { MessageController } from './messages.controller';
import { MessageService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageRepository])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessagesModule {}
