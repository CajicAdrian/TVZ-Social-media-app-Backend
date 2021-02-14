import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v1 as uuidv1 } from 'uuid';
import type { Image } from './image.entity';

@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}
  @Get()
  re() {
    return 'adsas';
  }
  @Post('/user-image')
  @UseInterceptors(
    FileInterceptor('user', {
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
    @UploadedFile() user: Express.Multer.File,
  ): Promise<Image> {
    return this.imagesService.createImage(user);
  }

  @UseInterceptors(
    FilesInterceptor('images', undefined, {
      storage: diskStorage({
        destination: './static/images/post-images',
        filename: (_req, file, cb) => {
          const randomName = uuidv1();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post('/post-images')
  async uploadPostImages(
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<Image[]> {
    return this.imagesService.createImages(images);
  }
}
