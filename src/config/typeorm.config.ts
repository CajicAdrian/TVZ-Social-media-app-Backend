import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 47383,
  username: 'user',
  password: '1234',
  database: 'tasks',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
