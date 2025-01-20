import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './notifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])], // Import Notification entity
  controllers: [NotificationsController], // Register NotificationsController
  providers: [NotificationsService], // Register NotificationsService
  exports: [NotificationsService], // Export the service for use in other modules
})
export class NotificationsModule {}
