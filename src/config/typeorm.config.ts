import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 47333,
  username: 'user',
  password: '1234',
  database: 'social-media-db',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
