import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ✅ Get Like Notifications setting
  @Get(':userId/like-notifications')
  async getLikeNotifications(
    @Param('userId') userId: number,
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.settingsService.getLikeNotifications(userId);
    return { enabled };
  }

  // ✅ Get Comment Notifications setting
  @Get(':userId/comment-notifications')
  async getCommentNotifications(
    @Param('userId') userId: number,
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.settingsService.getCommentNotifications(userId);
    return { enabled };
  }

  // ✅ Update Like Notifications setting
  @Patch(':userId/like-notifications')
  async updateLikeNotifications(
    @Param('userId') userId: number,
    @Body('enabled') enabled: boolean,
  ): Promise<{ success: boolean }> {
    await this.settingsService.updateLikeNotifications(userId, enabled);
    return { success: true };
  }

  // ✅ Update Comment Notifications setting
  @Patch(':userId/comment-notifications')
  async updateCommentNotifications(
    @Param('userId') userId: number,
    @Body('enabled') enabled: boolean,
  ): Promise<{ success: boolean }> {
    await this.settingsService.updateCommentNotifications(userId, enabled);
    return { success: true };
  }

  @Get(':userId/notification-refresh-rate')
  async getNotificationRefreshRate(@Param('userId') userId: number) {
    return {
      refreshRate: await this.settingsService.getNotificationRefreshRate(
        userId,
      ),
    };
  }

  @Patch(':userId/notification-refresh-rate')
  async updateNotificationRefreshRate(
    @Param('userId') userId: number,
    @Body('rate') rate: string,
  ) {
    await this.settingsService.updateNotificationRefreshRate(userId, rate);
    return { success: true };
  }

  @Get(':userId/language')
  async getUserLanguage(@Param('userId') userId: number) {
    const language = await this.settingsService.getUserLanguage(userId);
    return { language };
  }

  // ✅ Update User Language
  @Patch(':userId/language')
  async updateUserLanguage(
    @Param('userId') userId: number,
    @Body('language') language: string,
  ) {
    await this.settingsService.updateUserLanguage(userId, language);
    return { success: true };
  }

  // ✅ Get User Dark Mode Preference
  @Get(':userId/dark-mode')
  async getUserTheme(@Param('userId') userId: number) {
    const darkMode = await this.settingsService.getUserTheme(userId);
    return { darkMode };
  }

  // ✅ Update User Dark Mode Preference
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
}
