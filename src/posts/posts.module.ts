import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ImageRepository } from 'src/images/image.repository';
import { ImagesModule } from 'src/images/images.module';
import { PostRepository } from './post.repository';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostRepository]),
    TypeOrmModule.forFeature([ImageRepository]),
    AuthModule,
    ImagesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
