import { Injectable, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { User } from 'src/auth/user.entity';

@Injectable()
export class EnvService {
  async getEnvContent(): Promise<string> {
    try {
      const filePath = path.resolve(__dirname, '../../.env.dev');

      await fs.access(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new ForbiddenException('.env file not found');
      } else {
        throw new ForbiddenException(
          `Error reading .env file: ${error.message}`,
        );
      }
    }
  }

  async updateEnvContent(content: string, user: User): Promise<void> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Permission Denied');
    }

    try {
      const filePath = path.resolve(__dirname, '../../.env.dev');
      const Content = `JWT_SECRET=${content}\n`;
      await fs.writeFile(filePath, Content, 'utf-8');
    } catch (error) {
      throw new ForbiddenException('Error updating .env file');
    }
  }
}
