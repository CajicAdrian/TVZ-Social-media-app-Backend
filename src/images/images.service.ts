import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageRepository } from './image.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { UserRepository } from 'src/auth/user.repository';
import { IniHelper } from 'src/utils/ini.helper';

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

    const maxSize = await IniHelper.getSetting('MaxUploadSize');
    const MaxSizeInBytes = parseInt(maxSize) * 1024;

    if (image.size > MaxSizeInBytes) {
      throw new BadRequestException(
        `File is too large. Maximum allowed size is ${maxSize}MB`,
      );
    }

    const filePath =
      type === 'profile'
        ? `static/images/user-image/${image.filename}`
        : `static/images/post-images/${image.filename}`;

    const uploadedImage = await this.imageRepository.createImage(
      image,
      filePath,
    );

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
