import {
  Injectable,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private imageRepository: ImageRepository,
    private jwtService: JwtService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.signUp(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; user: User }> {
    const username = await this.userRepository.validateUserPassword(
      authCredentialsDto,
    );
    console.log('Validated Username:', username); // Log username validation result

    if (!username) {
      console.log('Invalid credentials provided'); // Log invalid login attempt
      throw new UnauthorizedException(`Invalid credentials`);
    }

    const user = await this.userRepository.findOne({ username });
    console.log('Retrieved User:', user); // Log retrieved user details

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);

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
