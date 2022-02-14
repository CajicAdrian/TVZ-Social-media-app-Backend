import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ImageRepository } from 'src/images/image.repository';
import { PostRepository } from 'src/posts/post.repository';
import { PostsModule } from 'src/posts/posts.module';
import { CommentRepository } from './comment.repository';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentRepository]),
    TypeOrmModule.forFeature([PostRepository]),
    TypeOrmModule.forFeature([ImageRepository]),
    PostsModule,
    AuthModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
