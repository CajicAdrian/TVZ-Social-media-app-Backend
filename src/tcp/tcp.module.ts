import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from 'src/images/image.repository';
import { PostRepository } from 'src/posts/post.repository';

import { createTcpProviders } from './tcp.providers';
import { TcpService } from './tcp.service';
import { TcpBindOptions } from './tcp.types';

@Module({
  providers: [TcpService],
  exports: [TcpService],
  imports: [
    TypeOrmModule.forFeature([PostRepository]),
    TypeOrmModule.forFeature([ImageRepository]),
  ],
})
export class TcpModule {
  static forRoot(
    bindOptions: TcpBindOptions = { address: '127.0.0.1', port: 3001 },
  ): DynamicModule {
    const providers = createTcpProviders(bindOptions);
    return {
      module: TcpModule,
      providers: [...providers],
      exports: [...providers],
    };
  }
}
