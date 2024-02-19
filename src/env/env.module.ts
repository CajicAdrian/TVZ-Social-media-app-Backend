import { Module } from '@nestjs/common';
import { EnvController } from './env.controller';
import { EnvService } from './env.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [EnvController],
  providers: [EnvService],
})
export class EnvModule {}
