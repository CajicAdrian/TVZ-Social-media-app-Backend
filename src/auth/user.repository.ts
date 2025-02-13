import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from './role.enum';
import { IniHelper } from 'src/utils/ini.helper';

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
    user.salt = await bcrypt.genSalt();
    user.pepper = await bcrypt.genSalt();

    const pepperPassword = password + user.pepper;
    user.password = await this.hashPassword(pepperPassword, user.salt);
    user.role = isAdmin ? Role.ADMIN : Role.USER;

    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
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

  private async hashPassword(
    pepperPassword: string,
    salt: string,
  ): Promise<string> {
    return bcrypt.hash(pepperPassword, salt);
  }
}
