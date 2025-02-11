import { exec } from 'child_process';
import * as os from 'os';

export class RegistryHelper {
  private static isWindows = os.platform() === 'win32';

  // ✅ Default settings (if missing, these values are used)
  private static defaultSettings: Record<string, string> = {
    likeNotifications: '1', // ✅ Boolean (1 = true, 0 = false)
    commentNotifications: '1', // ✅ Boolean (1 = true, 0 = false)
    darkMode: 'light', // ✅ Boolean (1 = enabled, 0 = disabled)
    notificationRefreshRate: '30s', // ✅ Multiple choice (10s, 30s, 1min)
    language: 'en', // ✅ Multiple choice (en, fr, de, es, it)
  };

  // ✅ Function to run registry commands in WINE (Linux) or Windows
  private static runRegCommand(
    command: string,
    callback: (output: string | null) => void,
  ) {
    const fullCommand = this.isWindows ? command : `wine ${command}`;

    exec(fullCommand, (error, stdout) => {
      if (error) {
        console.error('❌ Registry Command Failed:', error);
        callback(null);
      } else {
        callback(stdout.trim());
      }
    });
  }

  // ✅ Get a setting, return default if missing
  static async getSetting(userId: number, key: string): Promise<string> {
    return new Promise((resolve) => {
      const command = `reg query "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key}`;

      this.runRegCommand(command, (output) => {
        if (!output) {
          console.warn(`🚨 Missing registry key ${key}, using default.`);
          resolve(this.defaultSettings[key] || ''); // ✅ Use default value
        } else {
          const match = output.match(/REG_SZ\s+(.+)/);
          const value = match ? match[1] : '';
          console.log(`✅ Loaded registry key ${key}: ${value}`);
          resolve(value);
        }
      });
    });
  }

  // ✅ Set a registry setting using WINE or Windows
  static async setSetting(
    userId: number,
    key: string,
    value: boolean | number | string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const formattedValue =
        typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
      const command = `reg add "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key} /t REG_SZ /d ${formattedValue} /f`;

      this.runRegCommand(command, (output) => {
        if (!output) {
          console.error(`❌ Failed to write ${key}`);
          reject(new Error(`Failed to write ${key}`));
        } else {
          console.log(`✅ Updated registry key ${key} to ${formattedValue}`);
          resolve();
        }
      });
    });
  }
}
