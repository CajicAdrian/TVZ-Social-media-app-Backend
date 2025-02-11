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
import * as bcrypt from 'bcrypt';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { RegistryHelper } from '../utils/registry.helper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    @InjectRepository(ImageRepository)
    private imageRepository: ImageRepository,
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
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const pepperPassword = password + user.pepper;
    const hashedPassword = await bcrypt.hash(pepperPassword, user.salt);

    if (user.password !== hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ✅ Generate JWT token using the hardcoded secret
    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }

  async updateUserRole(userId: number, newRole: Role): Promise<void> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    user.role = newRole;

    await user.save();
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

    // Generate a new JWT token for the updated user
    const payload: JwtPayload = { username: user.username };
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
      relations: ['posts'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.posts && user.posts.length > 0) {
      await Promise.all(
        user.posts.map(async (post) => {
          if (post.images && post.images.length > 0) {
            await Promise.all(
              post.images.map(async (image) =>
                this.imageRepository.remove(image),
              ),
            );
          }
          await this.postRepository.remove(post);
        }),
      );
    }

    await this.userRepository.remove(user);
  }
}
