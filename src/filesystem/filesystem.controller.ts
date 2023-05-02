import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  StreamableFile,
  Type,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesystemService } from './filesystem.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';

export function getControllerClass(route: string): Type<any> {
  @Controller(route)
  @UseGuards(AuthGuard)
  class FilesystemController {
    constructor(private filesystemService: FilesystemService) {
      if (!this.filesystemService.checkFilesystemFolderExists(route)) {
        this.filesystemService.createFilesystemFolder(route);
      }
    }

    @Get()
    async getFilesystemInfo() {
      return await this.filesystemService.getFileSystemInfo(route);
    }

    @Get(':filename/download')
    async downloadFile(@Param() { filename }) {
      const exist = await this.filesystemService.checkFileExists(
        route,
        filename,
      );

      if (!exist)
        return new HttpException('File not found', HttpStatus.NOT_FOUND);

      const file = await this.filesystemService.getFileContent(route, filename);
      if (file === false)
        return new HttpException(
          'File can not be read',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      return new StreamableFile(file as Buffer);
    }

    @Get(':filename')
    async getFileInfo(@Param() { filename }) {
      const file = await this.filesystemService.checkFileExists(
        route,
        filename,
      );
      if (!file)
        return new HttpException('File not found', HttpStatus.NOT_FOUND);

      return { name: file.name, size: file.size };
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      const { fieldname, originalname, size, buffer } = file;
      const sizeInKB = size < 1024 ? 0 : Math.floor(size / 1024);

      const isExists = await this.filesystemService.checkFileExists(
        route,
        originalname,
      );
      if (isExists)
        return new HttpException('File already exists', HttpStatus.FORBIDDEN);

      const isAllowedSize = await this.filesystemService.checkFileSize(
        route,
        originalname,
        sizeInKB,
      );

      if (!isAllowedSize)
        return new HttpException('File is too big', HttpStatus.NOT_ACCEPTABLE);

      const isAllowedExtension =
        await this.filesystemService.checkFileExtension(route, originalname);

      if (!isAllowedExtension)
        return new HttpException(
          'File extension is not allowed',
          HttpStatus.NOT_ACCEPTABLE,
        );

      const isFileWrited = await this.filesystemService.writeFile(
        route,
        originalname,
        buffer,
      );

      const isFileAdded = await this.filesystemService.addFileToDB(
        route,
        originalname,
        sizeInKB,
      );

      if (!isFileWrited || !isFileAdded) {
        return new HttpException(
          'File can not be saved',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { fieldname, originalname, size: sizeInKB };
    }

    @Delete(':filename')
    async deleteFile(@Param() { filename }) {
      const file = await this.filesystemService.checkFileExists(
        route,
        filename,
      );
      if (!file)
        return new HttpException('File not found', HttpStatus.NOT_FOUND);

      const deletedFromDB = await this.filesystemService.deleteFileFromDB(
        file.id,
      );
      const deleted = await this.filesystemService.deleteFile(route, filename);
      if (!deletedFromDB || !deleted)
        return new HttpException(
          'File can not be deleted',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      return { name: file.name, size: file.size };
    }
  }

  return FilesystemController;
}
