import * as ini from 'ini';
import * as fs from 'fs-extra';
import * as path from 'path';

export class IniHelper {
  private static iniPath = path.join(__dirname, '../../config/settings.ini');

  // ✅ Ensure the INI file exists with default values
  private static ensureIniFileExists() {
    if (!fs.existsSync(this.iniPath)) {
      console.warn('⚠️ INI file not found, creating default settings.ini');
      const defaultConfig = {
        General: {
          AdminUsername: 'DomV', // Default admin user
          MaxUploadSize: '10',
          TokenExpirationTime: '3600',
        },
      };
      fs.writeFileSync(this.iniPath, ini.stringify(defaultConfig));
    }
  }

  // ✅ Get a setting from the INI file
  static async getSetting(key: string): Promise<string> {
    this.ensureIniFileExists();
    const config = ini.parse(fs.readFileSync(this.iniPath, 'utf-8'));
    return config['General']?.[key] || '';
  }

  // ✅ Set a setting in the INI file
  static async setSetting(key: string, value: string): Promise<void> {
    this.ensureIniFileExists();
    const config = ini.parse(fs.readFileSync(this.iniPath, 'utf-8'));
    if (!config['General']) config['General'] = {};
    config['General'][key] = value;
    fs.writeFileSync(this.iniPath, ini.stringify(config));
  }
}
