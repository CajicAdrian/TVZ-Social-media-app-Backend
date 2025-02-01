import { Repository, EntityRepository } from 'typeorm';
import { Image } from './image.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

@EntityRepository(Image)
export class ImageRepository extends Repository<Image> {
  async createImage(
    image: Express.Multer.File,
    filePath: string,
  ): Promise<Image> {
    if (!image.mimetype.startsWith('image/')) {
      throw new HttpException('Forbidden', HttpStatus.BAD_REQUEST);
    }

    const imageEntity = new Image();
    imageEntity.fileName = image.filename;
    imageEntity.filePath = filePath; // Use the correct filePath based on type

    await imageEntity.save();
    return imageEntity;
  }
}
