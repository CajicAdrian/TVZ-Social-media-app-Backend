import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v1 as uuidv1 } from 'uuid';
import type { Image } from './image.entity';

@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}
  @Post('/user-image/:userId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './static/images/user-image',
        filename: (_req, file, cb) => {
          const randomName = uuidv1();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadUserImage(
    @Param('userId') userId: number,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const uploadedImage = await this.imagesService.createImage(
      userId,
      image,
      'profile',
    );

    return {
      fileName: uploadedImage.fileName,
      filePath: uploadedImage.filePath.replace('static', ''),
    };
  }
  @Post('/post-images')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './static/images/post-images',
        filename: (_req, file, cb) => {
          const randomName = uuidv1();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadPostImage(@UploadedFile() image: Express.Multer.File) {
    return this.imagesService.createImage(null, image, 'post');
  }

  @Get()
  async findImage(imageId: number): Promise<Image> {
    return this.imagesService.findImage(imageId);
  }
}
