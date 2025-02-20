import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ImageRepository } from 'src/images/image.repository';
import { PostRepository } from 'src/posts/post.repository';
import { PostsModule } from 'src/posts/posts.module';
import { LikeRepository } from './like.repository';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([LikeRepository, PostRepository, ImageRepository]),
    PostsModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
