import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { UserRepository } from './user.repository';
import { Role } from './role.enum';
import { User } from './user.entity';
import { PostRepository } from 'src/posts/post.repository';
import { ImageRepository } from 'src/images/image.repository';
import { Not } from 'typeorm';
import { IniHelper } from '../utils/ini.helper';
import { LikeRepository } from 'src/likes/like.repository';
import { CommentRepository } from 'src/comments/comment.repository';
import { NotificationsRepository } from 'src/notifications/notifications.repository';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    @InjectRepository(ImageRepository)
    private imageRepository: ImageRepository,
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository,
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
    @InjectRepository(NotificationsRepository)
    private notificationRepository: NotificationsRepository,
    private jwtService: JwtService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'username',
        'role',
        'profileImage',
        'email',
        'bio',
        'gender',
      ],
    });
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne(userId, {
      select: [
        'id',
        'username',
        'role',
        'profileImage',
        'email',
        'bio',
        'gender',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async getAllUsersExcept(userId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { id: Not(userId) },
      select: ['id', 'username', 'profileImage'],
    });
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.userRepository.signUp(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.userRepository.signIn(authCredentialsDto);

    const expirationTime = await IniHelper.getSetting('TokenExpirationTime');
    const expiresIn = `${expirationTime}s`;

    const payload: JwtPayload = {
      username: user.username,
      role: user.role as Role,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return { accessToken, user };
  }

  async updateUserRole(userId: number, newRole: Role): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.role = newRole;
    await this.userRepository.save(user);
  }

  async updateUserSettings(
    userId: number,
    updateData: Partial<User>,
  ): Promise<{ user: User; newToken: string }> {
    const user = await this.userRepository.findOne(userId);

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    const userRole = user.role as Role;
    const payload: JwtPayload = { username: user.username, role: userRole };
    const newToken = this.jwtService.sign(payload);

    return { user, newToken };
  }

  async updateUserProfileImage(
    userId: number,
    filePath: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    user.profileImage = filePath;
    await this.userRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne(userId, {
      relations: ['posts', 'comments', 'likes', 'notifications'],
    });

    if (user.posts && user.posts.length > 0) {
      await Promise.all(
        user.posts.map(async (post) => {
          if (post.images && post.images.length > 0) {
            await this.imageRepository.remove(post.images);
          }
          await this.postRepository.remove(post);
        }),
      );
    }

    await this.userRepository.remove(user);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne(userId);

    const dynamicSalt = user.salt;

    const possiblePeppers = process.env.PEPPER_VALUES?.split(',') || [];
    if (!possiblePeppers.length) {
      throw new UnauthorizedException(
        'Server misconfiguration: No valid pepper found',
      );
    }

    let isValid = false;
    for (const pepper of possiblePeppers) {
      const hashedCurrentPassword = createHash('sha256')
        .update(currentPassword + pepper + dynamicSalt)
        .digest('hex');

      if (user.passwords.includes(hashedCurrentPassword)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const latestPepper = possiblePeppers[possiblePeppers.length - 1];
    const newHashedPassword = createHash('sha256')
      .update(newPassword + latestPepper + dynamicSalt)
      .digest('hex');

    user.passwords.push(newHashedPassword);

    if (user.passwords.length > 5) {
      user.passwords.shift();
    }

    await user.save();
  }
}
