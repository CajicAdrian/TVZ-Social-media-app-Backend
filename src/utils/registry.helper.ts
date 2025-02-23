import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class RegistryHelper {
  private static isWindows = os.platform() === 'win32';

  // ✅ Default settings (used if registry keys are missing)
  private static defaultSettings: Record<string, string> = {
    likeNotifications: '1',
    commentNotifications: '1',
    darkMode: 'light',
    notificationRefreshRate: '30s',
    language: 'en',
  };

  // ✅ Run registry commands, using `wine` if on Linux
  private static async runRegCommand(command: string): Promise<string | null> {
    const fullCommand = this.isWindows ? command : `wine ${command}`;
    console.log(`🛠 Running command: ${fullCommand}`);

    return new Promise((resolve) => {
      exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Registry Command Error: ${error.message}`);
          resolve(null);
          return;
        }
        if (stderr) {
          console.warn(`⚠️ Registry Command Stderr: ${stderr.trim()}`);
        }

        console.log(`✅ Registry Command Output: ${stdout.trim()}`);
        resolve(stdout.trim());
      });
    });
  }

  // ✅ Fetch a setting from Windows Registry (Supports Wine on Linux)
  static async getSetting(userId: number, key: string): Promise<string> {
    console.log(`🔎 Fetching setting for User ID: ${userId}, Key: ${key}`);

    const command = `reg query "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key}`;
    console.log(`🛠 Running registry query: ${command}`);

    try {
      const output = await this.runRegCommand(command);
      console.log(`📜 Raw Registry Output: ${output}`);

      if (!output) {
        console.warn(`🚨 Missing registry key ${key}, using default value.`);
        return this.defaultSettings[key] || '';
      }

      const match = output.match(/REG_SZ\s+(.+)/);
      if (!match) {
        console.warn(
          `🚨 Could not parse registry value for ${key}, using default.`,
        );
        return this.defaultSettings[key] || '';
      }

      const value = match[1].trim();
      console.log(`✅ Loaded registry key ${key}: ${value}`);
      return value;
    } catch (error) {
      console.error(`❌ Error fetching registry key ${key}:`, error);
      return this.defaultSettings[key] || '';
    }
  }

  // ✅ Set a registry setting (Supports Wine on Linux)
  static async setSetting(
    userId: number,
    key: string,
    value: boolean | number | string,
  ): Promise<void> {
    console.log(
      `📝 Updating setting for User ID: ${userId}, Key: ${key}, Value: ${value}`,
    );

    try {
      const formattedValue =
        typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
      const command = `reg add "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key} /t REG_SZ /d ${formattedValue} /f`;

      console.log(`🛠 Running registry set command: ${command}`);

      const output = await this.runRegCommand(command);
      console.log(`📜 Registry Set Output: ${output}`);

      if (!output) {
        console.error(`❌ Failed to write ${key}`);
        throw new Error(`Failed to write ${key}`);
      }

      console.log(
        `✅ Successfully updated registry key ${key} to ${formattedValue}`,
      );
    } catch (error) {
      console.error(`❌ Error updating registry key ${key}:`, error);
      throw new Error(`Failed to write ${key}`);
    }
  }
}
