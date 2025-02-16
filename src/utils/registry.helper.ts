import { Worker } from 'worker_threads';
import * as os from 'os';
import * as path from 'path';

export class RegistryHelper {
  private static isWindows = os.platform() === 'win32';
  private static workerPath = path.resolve(__dirname, 'registry.worker.js');

  // ✅ Default settings (used if registry keys are missing)
  private static defaultSettings: Record<string, string> = {
    likeNotifications: '1',
    commentNotifications: '1',
    darkMode: 'light',
    notificationRefreshRate: '30s',
    language: 'en',
  };

  // ✅ Function to run registry commands inside a worker thread
  private static runRegCommand(command: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      console.log(`🛠 Spawning worker at: ${this.workerPath}`);

      const worker = new Worker(this.workerPath, {
        workerData: { command, isWindows: this.isWindows },
      });

      // ✅ Handle successful response
      worker.on('message', (message) => {
        if (message.error) {
          console.error('❌ Registry Command Failed:', message.error);
          reject(null);
        } else {
          resolve(message.output);
        }
      });

      // ✅ Handle worker errors
      worker.on('error', (error) => {
        console.error('❌ Worker Error:', error);
        reject(null);
      });

      // ✅ Detect when the worker exits
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.warn(`⚠️ Worker stopped with exit code ${code}`);
        }
      });
    });
  }

  // ✅ Fetch a setting from Windows Registry
  static async getSetting(userId: number, key: string): Promise<string> {
    const command = `reg query "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key}`;

    try {
      const output = await this.runRegCommand(command);
      if (!output) {
        console.warn(`🚨 Missing registry key ${key}, using default.`);
        return this.defaultSettings[key] || '';
      }

      // ✅ Parse REG_SZ output correctly
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

  // ✅ Set a registry setting using the worker
  static async setSetting(
    userId: number,
    key: string,
    value: boolean | number | string,
  ): Promise<void> {
    const formattedValue =
      typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
    const command = `reg add "HKCU\\Software\\MyApp\\UserSettings\\${userId}" /v ${key} /t REG_SZ /d ${formattedValue} /f`;

    try {
      await this.runRegCommand(command);
      console.log(`✅ Updated registry key ${key} to ${formattedValue}`);
    } catch {
      console.error(`❌ Failed to write ${key}`);
      throw new Error(`Failed to write ${key}`);
    }
  }
}
