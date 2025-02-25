import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import { Role } from './role.enum';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSettingsDto } from './dto/update-settings.dto';

interface RequestWithUser extends Request {
  user?: { id: number };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/getallusers')
  @UseGuards(AuthGuard())
  async getAllUsers(@GetUser() user: User): Promise<User[]> {
    return this.authService.getAllUsers();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  async getCurrentUser(@GetUser() user: User): Promise<User> {
    return this.authService.getUserById(user.id);
  }

  @Get('/getallusers/exceptme')
  @UseGuards(AuthGuard())
  async getAllUsersExceptMe(@GetUser() user: User): Promise<User[]> {
    return this.authService.getAllUsersExcept(user.id);
  }

  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<User> {
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
    @GetUser() user: User,
  ): Promise<void> {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to change user roles",
      );
    }
    const roleEnumValue = newRole.toUpperCase() as Role;

    if (!Object.values(Role).includes(roleEnumValue)) {
      throw new BadRequestException(`Invalid role value: ${newRole}`);
    }

    await this.authService.updateUserRole(userId, newRole);
  }

  @Patch('settings')
  @UseGuards(AuthGuard())
  async updateSettings(
    @GetUser() user: User,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<{ user: User; newToken: string }> {
    return this.authService.updateUserSettings(user.id, updateSettingsDto);
  }

  @Delete('/deleteuser/:id')
  @UseGuards(AuthGuard())
  async deleteUser(
    @Param('id', ParseIntPipe) userId: number,
    @GetUser() user: User,
  ): Promise<void> {
    if (user.role === Role.ADMIN || user.id === userId) {
      await this.authService.deleteUser(userId);
    } else {
      throw new ForbiddenException(
        "You don't have permission to delete this user",
      );
    }
  }

  @Patch('/change-password')
  @UseGuards(AuthGuard())
  async changePassword(
    @GetUser() user: User,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ success: boolean }> {
    await this.authService.changePassword(
      user.id,
      currentPassword,
      newPassword,
    );
    return { success: true };
  }
}
