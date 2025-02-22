import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ImageRepository } from 'src/images/image.repository';
import { PostRepository } from 'src/posts/post.repository';
import { PostsModule } from 'src/posts/posts.module';
import { CommentRepository } from './comment.repository';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PassportModule } from '@nestjs/passport';
import { LikesModule } from 'src/likes/likes.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      CommentRepository,
      PostRepository,
      ImageRepository,
    ]),
    PostsModule,
    AuthModule,
    forwardRef(() => NotificationsModule), // ✅ Fix circular dependency
    forwardRef(() => LikesModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
