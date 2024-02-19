import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EnvService } from './env.service';
import { User } from 'src/auth/user.entity';
import { Role } from 'src/auth/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('env')
@UseGuards(AuthGuard())
export class EnvController {
  constructor(private readonly envService: EnvService) {}

  @Get('getcontent')
  async getEnvContent(@Request() req: { user: User }): Promise<string> {
    if (req.user.role === 'ADMIN') {
      return this.envService.getEnvContent();
    } else {
      throw new ForbiddenException('Permission denied');
    }
  }

  @Post('updatecontent')
  @UseGuards(AuthGuard())
  async updateEnvContent(
    @Body('JWT_SECRET') content: string,
    @GetUser() user: User,
  ): Promise<void> {
    if (user.role === Role.ADMIN) {
      console.log(user.role);
      console.log(content);
      await this.envService.updateEnvContent(content, user);
    } else {
      throw new ForbiddenException('Permission denied');
    }
  }
}
