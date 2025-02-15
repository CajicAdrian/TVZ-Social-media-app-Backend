import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { PostRepository } from 'src/posts/post.repository';
import { ImageRepository } from 'src/images/image.repository';
import { LikeRepository } from 'src/likes/like.repository';
import { CommentRepository } from 'src/comments/comment.repository';
import { NotificationsRepository } from 'src/notifications/notifications.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'lord1234', // ✅ Define JWT_SECRET here instead of `.env`
    }),
    TypeOrmModule.forFeature([
      UserRepository,
      PostRepository,
      ImageRepository,
      LikeRepository,
      CommentRepository,
      NotificationsRepository,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
