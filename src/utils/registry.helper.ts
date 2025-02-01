import * as WinReg from 'winreg';

export class RegistryHelper {
  private static getRegistryKey(userId: number): WinReg {
    return new WinReg({
      hive: WinReg.HKCU, // Current user registry
      key: `\\Software\\MyApp\\UserSettings\\${userId}`,
    });
  }

  static async getSetting(userId: number, key: string): Promise<string | null> {
    return new Promise((resolve) => {
      const regKey = this.getRegistryKey(userId);
      regKey.get(key, (err, result) => {
        resolve(err || !result ? null : result.value);
      });
    });
  }

  static async setSetting(
    userId: number,
    key: string,
    value: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const regKey = this.getRegistryKey(userId);
      regKey.set(key, WinReg.REG_SZ, value, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }
}
