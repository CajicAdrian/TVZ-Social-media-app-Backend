import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from 'src/images/image.repository';
import { PostRepository } from 'src/posts/post.repository';

import { createUdpProviders } from './udp.providers';
import { UdpService } from './udp.service';
import { UdpBindOptions } from './udp.types';

@Module({
  providers: [UdpService],
  exports: [UdpService],
  imports: [
    TypeOrmModule.forFeature([PostRepository]),
    TypeOrmModule.forFeature([ImageRepository]),
  ],
})
export class UdpModule {
  static forRoot(
    bindOptions: UdpBindOptions = { address: '127.0.0.1', port: 3002 },
  ): DynamicModule {
    const providers = createUdpProviders(bindOptions);
    return {
      module: UdpModule,
      providers: [...providers],
      exports: [...providers],
    };
  }
}
