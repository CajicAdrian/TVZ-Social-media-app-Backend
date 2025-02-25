import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard())
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: number) {
    return this.notificationsService.getNotificationsForUser(Number(userId));
  }
}
