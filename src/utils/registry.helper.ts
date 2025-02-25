import * as os from 'os';
import { exec } from 'child_process';

export class RegistryHelper {
  private static isWindows = os.platform() === 'win32';

  private static defaultSettings: Record<string, string> = {
    likeNotifications: '1',
    commentNotifications: '1',
    darkMode: 'light',
    notificationRefreshRate: '30s',
    language: 'en',
  };

  private static async runRegCommand(command: string): Promise<string | null> {
    const fullCommand = this.isWindows ? command : `wine ${command}`;

    return new Promise((resolve) => {
      exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          resolve(null);
          return;
        }

        resolve(stdout.trim());
      });
    });
  }

  static async getSetting(userId: number, key: string): Promise<string> {
    const command = `reg query "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key}`;

    try {
      const output = await this.runRegCommand(command);

      if (!output) {
        return this.defaultSettings[key] || '';
      }

      const match = output.match(/REG_SZ\s+(.+)/);
      if (!match) {
        return this.defaultSettings[key] || '';
      }

      const value = match[1].trim();
      return value;
    } catch (error) {
      return this.defaultSettings[key] || '';
    }
  }

  static async setSetting(
    userId: number,
    key: string,
    value: boolean | number | string,
  ): Promise<void> {
    try {
      const formattedValue =
        typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
      const command = `reg add "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key} /t REG_SZ /d ${formattedValue} /f`;
      const output = await this.runRegCommand(command);

      if (!output) {
        throw new Error(`Failed to write ${key}`);
      }
    } catch (error) {
      throw new Error(`Failed to write ${key}`);
    }
  }
}
