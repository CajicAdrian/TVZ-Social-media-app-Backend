import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { PostsModule } from 'src/posts/posts.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { CommentsModule } from 'src/comments/comments.module';
import { forwardRef } from '@nestjs/common';
import { LikesModule } from 'src/likes/likes.module';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([NotificationsRepository]),
    PostsModule, // Import PostsModule for Post-related operations
    AuthModule, // Import AuthModule for User-related operations
    forwardRef(() => CommentsModule), // ✅ Fix circular dependency
    forwardRef(() => LikesModule), // ✅ Fix circular dependency
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
