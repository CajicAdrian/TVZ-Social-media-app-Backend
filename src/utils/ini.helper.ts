import * as ini from 'ini';
import * as fs from 'fs-extra';
import * as path from 'path';

export class IniHelper {
  private static iniPath = path.join(__dirname, '../../config/settings.ini');

  private static ensureIniFileExists() {
    if (!fs.existsSync(this.iniPath)) {
      const defaultConfig = {
        General: {
          AdminUsername: 'DomV',
          MaxUploadSize: '10',
          TokenExpirationTime: '3600',
        },
      };
      fs.writeFileSync(this.iniPath, ini.stringify(defaultConfig));
    }
  }

  static async getSetting(key: string): Promise<string> {
    this.ensureIniFileExists();
    const config = ini.parse(fs.readFileSync(this.iniPath, 'utf-8'));
    return config['General']?.[key] || '';
  }

  static async setSetting(key: string, value: string): Promise<void> {
    this.ensureIniFileExists();
    const config = ini.parse(fs.readFileSync(this.iniPath, 'utf-8'));
    if (!config['General']) config['General'] = {};
    config['General'][key] = value;
    fs.writeFileSync(this.iniPath, ini.stringify(config));
  }
}
