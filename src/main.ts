import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
    ],
    methods: 'GET, POST, OPTIONS, PATCH, DELETE',
    credentials: true,
  });
  app.use(cors());
  await app.listen(3000);
}
bootstrap();
