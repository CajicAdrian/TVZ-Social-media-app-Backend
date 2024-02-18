import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import { Role } from './role.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/getallusers')
  @UseGuards(AuthGuard())
  async getAllUsers(@GetUser() requestingUser: User): Promise<User[]> {
    return this.authService.getAllUsers();
  }

  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Patch('/updaterole/:id')
  @UseGuards(AuthGuard())
  async updateRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body('role') newRole: Role,
    @GetUser() requestingUser: User,
  ): Promise<void> {
    if (requestingUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to change user roles",
      );
    }
    await this.authService.updateUserRole(userId, newRole);
  }

  @Delete('/deleteuser/:id')
  @UseGuards(AuthGuard())
  async deleteUser(
    @Param('id', ParseIntPipe) userId: number,
    @GetUser() requestingUser: User,
  ): Promise<void> {
    if (requestingUser.role === Role.ADMIN || requestingUser.id === userId) {
      await this.authService.deleteUser(userId);
    } else {
      throw new ForbiddenException(
        "You don't have permission to delete this user",
      );
    }
  }
}
