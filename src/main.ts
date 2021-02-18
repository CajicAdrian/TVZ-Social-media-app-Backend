import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://plexxis.thefalcontech.com',
      'https://practical-ardinghelli-46288e.netlify.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
    ],
    methods: 'GET, POST, OPTIONS, PATCH, DELETE',
  });
  app.use(cors());
  await app.listen(3000);
}
bootstrap();
