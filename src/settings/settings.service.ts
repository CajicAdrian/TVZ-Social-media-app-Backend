import { Injectable } from '@nestjs/common';
import { RegistryHelper } from '../utils/registry.helper';

@Injectable()
export class SettingsService {
  // ✅ Get Like Notifications setting
  async getLikeNotifications(userId: number): Promise<boolean> {
    const value = await RegistryHelper.getSetting(userId, 'likeNotifications');
    return value === '1'; // Convert '1' to true, '0' to false
  }

  // ✅ Get Comment Notifications setting
  async getCommentNotifications(userId: number): Promise<boolean> {
    const value = await RegistryHelper.getSetting(
      userId,
      'commentNotifications',
    );
    return value === '1'; // Convert '1' to true, '0' to false
  }

  // ✅ Toggle Like Notifications setting
  async updateLikeNotifications(
    userId: number,
    enabled: boolean,
  ): Promise<void> {
    await RegistryHelper.setSetting(userId, 'likeNotifications', enabled);
  }

  // ✅ Toggle Comment Notifications setting
  async updateCommentNotifications(
    userId: number,
    enabled: boolean,
  ): Promise<void> {
    await RegistryHelper.setSetting(userId, 'commentNotifications', enabled);
  }

  async getNotificationRefreshRate(userId: number): Promise<string> {
    const value = await RegistryHelper.getSetting(
      userId,
      'notificationRefreshRate',
    );
    return value || '30s'; // Default to 30s if not set
  }

  async updateNotificationRefreshRate(
    userId: number,
    rate: string,
  ): Promise<void> {
    await RegistryHelper.setSetting(userId, 'notificationRefreshRate', rate);
  }
  async getUserLanguage(userId: number): Promise<string> {
    return await RegistryHelper.getSetting(userId, 'language');
  }

  // ✅ Update User Language
  async updateUserLanguage(userId: number, language: string): Promise<void> {
    await RegistryHelper.setSetting(userId, 'language', language);
  }

  // ✅ Get User Dark Mode Preference
  async getUserTheme(userId: number): Promise<string> {
    const darkMode = await RegistryHelper.getSetting(userId, 'darkMode');
    return darkMode === 'dark' ? 'dark' : 'light'; // ✅ Always return "dark" or "light"
  }

  // ✅ Update User Dark Mode Preference
  async updateUserTheme(userId: number, darkMode: string): Promise<void> {
    if (darkMode !== 'dark' && darkMode !== 'light') {
      throw new Error('Invalid theme value. Must be "dark" or "light".');
    }
    await RegistryHelper.setSetting(userId, 'darkMode', darkMode);
  }

  async getAllSettings(userId: number): Promise<Record<string, any>> {
    const [
      language,
      darkMode,
      likeNotifications,
      commentNotifications,
      refreshRate,
    ] = await Promise.all([
      RegistryHelper.getSetting(userId, 'language'),
      RegistryHelper.getSetting(userId, 'darkMode'),
      RegistryHelper.getSetting(userId, 'likeNotifications'),
      RegistryHelper.getSetting(userId, 'commentNotifications'),
      RegistryHelper.getSetting(userId, 'notificationRefreshRate'),
    ]);

    return {
      language,
      darkMode: darkMode === 'dark' ? 'dark' : 'light',
      likeNotifications: likeNotifications === '1',
      commentNotifications: commentNotifications === '1',
      notificationRefreshRate: refreshRate,
    };
  }
}
