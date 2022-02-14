import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './config/typeorm.config';
import { ImagesModule } from './images/images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TcpModule } from './tcp/tcp.module';
import { UdpModule } from './udp/udp.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [
    PostsModule,
    AuthModule,
    TypeOrmModule.forRoot(typeormConfig),
    ImagesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
    TcpModule.forRoot({ address: '127.0.0.1', port: 3001 }),
    UdpModule.forRoot({ address: '127.0.0.1', port: 3002 }),
    CommentsModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
