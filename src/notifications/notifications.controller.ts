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
      user.id,
    );
    return notifications;
  }
  @Get(':userId') // ✅ Fetch notifications for a specific user
  async getUserNotifications(@Param('userId') userId: number) {
    return this.notificationsService.getNotificationsForUser(Number(userId)); // ✅ Ensure userId is a number
  }
}
