import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.enum';
import { IniHelper } from 'src/utils/ini.helper';
import { createHash } from 'crypto';
import { generateRSAKeyPair } from 'src/utils/utils';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(
    authCredentialsDto: AuthCredentialsDto,
    role: Role = Role.USER,
  ): Promise<User> {
    const { username, password } = authCredentialsDto;
    const adminUsername = await IniHelper.getSetting('AdminUsername');
    const isAdmin = username === adminUsername;
    const user = new User();
    user.username = username;

    // ✅ Use a fixed salt per user instead of a time-based one
    const dynamicSalt = createHash('sha256').update(username).digest('hex');

    let possiblePeppers = process.env.PEPPER_VALUES?.split(',') || [];

    if (!possiblePeppers.length) {
      throw new InternalServerErrorException(
        'Server misconfiguration: No valid pepper found',
      );
    }

    const latestPepper = possiblePeppers[possiblePeppers.length - 1];

    const hashedPassword = createHash('sha256')
      .update(password + latestPepper + dynamicSalt)
      .digest('hex');

    user.passwords = [hashedPassword];
    user.salt = dynamicSalt;

    user.role = isAdmin ? Role.ADMIN : Role.USER;

    const { publicKey, privateKey } = generateRSAKeyPair();
    user.publicKey = publicKey;
    user.privateKey = privateKey;

    const existingUser = await this.findOne({ username });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    await user.save();
    return user;
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const dynamicSalt = user.salt;
    let possiblePeppers = process.env.PEPPER_VALUES?.split(',') || [];

    if (!possiblePeppers.length) {
      throw new UnauthorizedException(
        'Server misconfiguration: No valid pepper found',
      );
    }

    const hashedPasswords = possiblePeppers.map((pepper) =>
      createHash('sha256')
        .update(password + pepper + dynamicSalt)
        .digest('hex'),
    );
    if (!hashedPasswords.some((hashed) => user.passwords.includes(hashed))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    if (user && (await user.validatePassword(password))) {
      return user.username;
    } else {
      return null;
    }
  }
}
