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
    try {
      const users = await this.userRepository.find({
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
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne(userId, {
      select: [
        'id',
        'username',
        'email',
        'bio',
        'gender',
        'profileImage',
        'role',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async getAllUsersExcept(userId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { id: Not(userId) }, // Exclude the current user
      select: ['id', 'username', 'profileImage'], // Specify the fields you want
    });
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.userRepository.signUp(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.userRepository.signIn(authCredentialsDto); // ✅ Call signIn from repository

    const expirationTime = await IniHelper.getSetting('TokenExpirationTime');
    const expiresIn = `${expirationTime}s`;

    const payload: JwtPayload = {
      username: user.username,
      role: user.role as Role,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    console.log(
      `🔑 Token successfully generated: ${accessToken} | Expiration: ${expiresIn}`,
    );

    return { accessToken, user };
  }

  async updateUserRole(userId: number, newRole: Role): Promise<void> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    console.log(`🔄 Changing role for ${user.username} to ${newRole}`);

    user.role = newRole;

    await this.userRepository.save(user);
  }

  async updateUserSettings(
    userId: number,
    updateData: Partial<User>,
  ): Promise<{ user: User; newToken: string }> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only the fields that are provided
    Object.assign(user, updateData);
    await this.userRepository.save(user); // ✅ Ensures changes persist

    const userRole = user.role as Role;
    // Generate a new JWT token for the updated user
    const payload: JwtPayload = { username: user.username, role: userRole };
    const newToken = this.jwtService.sign(payload);

    return { user, newToken };
  }

  async updateUserProfileImage(
    userId: number,
    filePath: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ✅ Store the new profile image path
    user.profileImage = filePath;
    await this.userRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne(userId, {
      relations: ['posts', 'comments', 'likes', 'notifications'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    console.log(`🛠️ Deleting User: ${user.username} (ID: ${userId})`);

    // ✅ Step 1: Delete User Comments (Prevents Foreign Key Constraint)
    if (user.comments && user.comments.length > 0) {
      console.log(`🗑️ Deleting ${user.comments.length} comments...`);
      await this.commentRepository.remove(user.comments);
    }

    // ✅ Step 2: Delete User Likes (Prevents Foreign Key Constraint)
    if (user.likes && user.likes.length > 0) {
      console.log(`🗑️ Deleting ${user.likes.length} likes...`);
      await this.likeRepository.remove(user.likes);
    }

    // ✅ Step 3: Delete User Notifications
    if (user.notifications && user.notifications.length > 0) {
      console.log(`🗑️ Deleting ${user.notifications.length} notifications...`);
      await this.notificationRepository.remove(user.notifications);
    }

    // ✅ Step 4: Delete User Posts & Images
    if (user.posts && user.posts.length > 0) {
      console.log(`🗑️ Deleting ${user.posts.length} posts...`);
      await Promise.all(
        user.posts.map(async (post) => {
          if (post.images && post.images.length > 0) {
            console.log(
              `🗑️ Deleting ${post.images.length} images from post ${post.id}...`,
            );
            await this.imageRepository.remove(post.images);
          }
          await this.postRepository.remove(post);
        }),
      );
    }

    // ✅ Step 5: Finally Delete the User
    console.log(`✅ Successfully deleting user: ${user.username}`);
    await this.userRepository.remove(user);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ✅ Use stored salt instead of regenerating it
    const dynamicSalt = user.salt;

    // 🔍 Retrieve list of possible peppers from .env
    const possiblePeppers = process.env.PEPPER_VALUES?.split(',') || [];
    if (!possiblePeppers.length) {
      throw new UnauthorizedException(
        'Server misconfiguration: No valid pepper found',
      );
    }

    // 🔐 Validate current password against stored password history
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

    // 🔐 Generate new hashed password with latest pepper
    const latestPepper = possiblePeppers[possiblePeppers.length - 1]; // ✅ Use latest pepper
    const newHashedPassword = createHash('sha256')
      .update(newPassword + latestPepper + dynamicSalt) // ✅ Use same hashing as sign-up
      .digest('hex');

    // ✅ Save new hashed password to history
    user.passwords.push(newHashedPassword);

    // ✅ Limit stored password history (optional security measure)
    if (user.passwords.length > 5) {
      user.passwords.shift(); // Remove the oldest password
    }

    await user.save();
  }
}
