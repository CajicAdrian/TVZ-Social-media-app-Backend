import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageRepository } from './image.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { UserRepository } from 'src/auth/user.repository';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageRepository) private imageRepository: ImageRepository,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  async createImage(
    userId: number | null,
    image: Express.Multer.File,
    type: 'profile' | 'post',
  ): Promise<Image> {
    if (!image.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Invalid file type. Please upload an image.',
      );
    }

    // Determine the correct file path
    const filePath =
      type === 'profile'
        ? `static/images/user-image/${image.filename}`
        : `static/images/post-images/${image.filename}`;

    // Save the image in the database
    const uploadedImage = await this.imageRepository.createImage(
      image,
      filePath,
    );

    // If it's a profile image, link it to the user
    if (type === 'profile' && userId !== null) {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      user.profileImage = uploadedImage.filePath;
      await user.save();
    }

    return uploadedImage;
  }

  async findImage(imageId: number): Promise<Image> {
    return this.imageRepository.findOne(imageId);
  }
}
