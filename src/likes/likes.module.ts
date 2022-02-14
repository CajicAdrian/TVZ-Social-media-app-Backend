import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ImageRepository } from 'src/images/image.repository';
import { PostRepository } from 'src/posts/post.repository';
import { PostsModule } from 'src/posts/posts.module';
import { LikeRepository } from './like.repository';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LikeRepository]),
    TypeOrmModule.forFeature([PostRepository]),
    TypeOrmModule.forFeature([ImageRepository]),
    PostsModule,
    AuthModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
