import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from './role.enum';
@Injectable()
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDto: AuthCredentialsDto, role: Role = Role.USER) {
    const { username, password } = authCredentialsDto;

    const user = new User();
    user.username = username;
    user.salt = await bcrypt.genSalt();

    user.pepper = await bcrypt.genSalt();

    const pepperPassword = password + user.pepper;
    user.password = await this.hashPassword(pepperPassword, user.salt);
    user.role = role;

    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  ntityRepository, 
  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ where: { username: username } });

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
