import { Injectable } from '@nestjs/common';
import { RegistryHelper } from '../utils/registry.helper';
import { IniHelper } from '../utils/ini.helper';

@Injectable()
export class SettingsService {
  async getLikeNotifications(userId: number): Promise<boolean> {
    const value = await RegistryHelper.getSetting(userId, 'likeNotifications');
    return value === '1';
  }

  async getCommentNotifications(userId: number): Promise<boolean> {
    const value = await RegistryHelper.getSetting(
      userId,
      'commentNotifications',
    );
    return value === '1';
  }

  async updateLikeNotifications(
    userId: number,
    enabled: boolean,
  ): Promise<void> {
    await RegistryHelper.setSetting(userId, 'likeNotifications', enabled);
  }

  async updateCommentNotifications(
    userId: number,
    enabled: boolean,
  ): Promise<void> {
    await RegistryHelper.setSetting(userId, 'commentNotifications', enabled);
  }

  async getUserLanguage(userId: number): Promise<string> {
    return await RegistryHelper.getSetting(userId, 'language');
  }

  async updateUserLanguage(userId: number, language: string): Promise<void> {
    await RegistryHelper.setSetting(userId, 'language', language);
  }

  async getUserTheme(userId: number): Promise<string> {
    const darkMode = await RegistryHelper.getSetting(userId, 'darkMode');
    return darkMode === 'dark' ? 'dark' : 'light';
  }

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
  async getAdminUsername(): Promise<string> {
    return await IniHelper.getSetting('AdminUsername');
  }

  async updateAdminUsername(newUsername: string): Promise<void> {
    await IniHelper.setSetting('AdminUsername', newUsername);
  }

  async getMaxUploadSize(): Promise<string> {
    return await IniHelper.getSetting('MaxUploadSize');
  }

  async updateMaxUploadSize(newSize: string): Promise<void> {
    await IniHelper.setSetting('MaxUploadSize', newSize);
  }

  async getTokenExpirationTime(): Promise<string> {
    return await IniHelper.getSetting('TokenExpirationTime');
  }

  async updateTokenExpirationTime(newTime: string): Promise<void> {
    await IniHelper.setSetting('TokenExpirationTime', newTime);
  }
}
