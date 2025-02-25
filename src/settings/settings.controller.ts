import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Role } from 'src/auth/role.enum';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':userId/like-notifications')
  async getLikeNotifications(
    @Param('userId') userId: number,
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.settingsService.getLikeNotifications(userId);
    return { enabled };
  }

  @Get(':userId/comment-notifications')
  async getCommentNotifications(
    @Param('userId') userId: number,
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.settingsService.getCommentNotifications(userId);
    return { enabled };
  }

  @Patch(':userId/like-notifications')
  async updateLikeNotifications(
    @Param('userId') userId: number,
    @Body('enabled') enabled: boolean,
  ): Promise<{ success: boolean }> {
    await this.settingsService.updateLikeNotifications(userId, enabled);
    return { success: true };
  }

  @Patch(':userId/comment-notifications')
  async updateCommentNotifications(
    @Param('userId') userId: number,
    @Body('enabled') enabled: boolean,
  ): Promise<{ success: boolean }> {
    await this.settingsService.updateCommentNotifications(userId, enabled);
    return { success: true };
  }

  @Get(':userId/language')
  async getUserLanguage(@Param('userId') userId: number) {
    const language = await this.settingsService.getUserLanguage(userId);
    return { language };
  }

  @Patch(':userId/language')
  async updateUserLanguage(
    @Param('userId') userId: number,
    @Body('language') language: string,
  ) {
    await this.settingsService.updateUserLanguage(userId, language);
    return { success: true };
  }

  @Get(':userId/dark-mode')
  async getUserTheme(@Param('userId') userId: number) {
    const darkMode = await this.settingsService.getUserTheme(userId);
    return { darkMode };
  }

  @Patch(':userId/dark-mode')
  async updateUserTheme(
    @Param('userId') userId: number,
    @Body('darkMode') darkMode: string,
  ) {
    if (darkMode !== 'dark' && darkMode !== 'light') {
      throw new Error('Invalid theme value. Must be "dark" or "light".');
    }
    await this.settingsService.updateUserTheme(userId, darkMode);
    return { success: true };
  }

  @Get(':userId/all')
  async getAllSettings(@Param('userId') userId: number) {
    const settings = await this.settingsService.getAllSettings(userId);
    return settings;
  }

  @Get('admin-username')
  async getAdminUsername(): Promise<{ adminUsername: string }> {
    const adminUsername = await this.settingsService.getAdminUsername();
    return { adminUsername };
  }

  @Patch('admin-username')
  @UseGuards(AuthGuard())
  async updateAdminUsername(
    @GetUser() user: User,
    @Body('adminUsername') adminUsername: string,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to change this setting",
      );
    }
    await this.settingsService.updateAdminUsername(adminUsername);
    return { success: true };
  }

  @Get('max-upload-size')
  async getMaxUploadSize(): Promise<{ maxUploadSize: string }> {
    const maxUploadSize = await this.settingsService.getMaxUploadSize();
    return { maxUploadSize };
  }

  @Patch('max-upload-size')
  @UseGuards(AuthGuard())
  async updateMaxUploadSize(
    @GetUser() user: User,
    @Body('maxUploadSize') maxUploadSize: string,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to change this setting",
      );
    }
    await this.settingsService.updateMaxUploadSize(maxUploadSize);
    return { success: true };
  }

  @Get('token-expiration-time')
  async getTokenExpirationTime(): Promise<{ tokenExpirationTime: string }> {
    const tokenExpirationTime = await this.settingsService.getTokenExpirationTime();
    return { tokenExpirationTime };
  }

  @Patch('token-expiration-time')
  @UseGuards(AuthGuard())
  async updateTokenExpirationTime(
    @GetUser() user: User,
    @Body('tokenExpirationTime') tokenExpirationTime: string,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to change this setting",
      );
    }

    await this.settingsService.updateTokenExpirationTime(tokenExpirationTime);
    return { success: true };
  }

  @Get('ini')
  async getIniSettings() {
    return {
      adminUsername: await this.settingsService.getAdminUsername(),
      maxUploadSize: await this.settingsService.getMaxUploadSize(),
      tokenExpirationTime: await this.settingsService.getTokenExpirationTime(), // ✅ Fixed
    };
  }
}
