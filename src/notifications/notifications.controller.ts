import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { NotificationsService } from './notifications.service';
import { User } from 'src/auth/user.entity';
import { Notification } from './notifications.entity';

@Controller('notifications')
@UseGuards(AuthGuard())
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@GetUser() user: User): Promise<Notification[]> {
    const notifications = await this.notificationsService.getNotificationsForUser(
      user,
    );
    return notifications;
  }

  @Patch('/:id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    await this.notificationsService.markAsRead(id, user);
  }
}
