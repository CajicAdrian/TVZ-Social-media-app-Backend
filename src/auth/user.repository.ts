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

    const possiblePeppers = process.env.PEPPER_VALUES?.split(',') || [];
    if (!possiblePeppers.length) {
      throw new InternalServerErrorException(
        'Server misconfiguration: No valid pepper found',
      );
    }

    const latestPepper = possiblePeppers[possiblePeppers.length - 1];

    const hashedPassword = createHash('sha256')
      .update(password + latestPepper + dynamicSalt)
      .digest('hex');

    // ✅ Store password and salt
    user.passwords = [hashedPassword];
    user.salt = dynamicSalt; // Store the salt

    user.role = isAdmin ? Role.ADMIN : Role.USER;

    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ✅ Use the stored salt instead of generating a new one
    const dynamicSalt = user.salt;

    const possiblePeppers = process.env.PEPPER_VALUES?.split(',') || [];
    if (!possiblePeppers.length) {
      throw new UnauthorizedException(
        'Server misconfiguration: No valid pepper found',
      );
    }

    // 🔐 Try multiple pepper values for validation
    let isValid = false;
    for (const pepper of possiblePeppers) {
      const hashedPassword = createHash('sha256')
        .update(password + pepper + dynamicSalt)
        .digest('hex');

      if (user.passwords.includes(hashedPassword)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user; // ✅ Return the authenticated user
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
