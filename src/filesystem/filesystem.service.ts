import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as fs from 'fs';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { Extension, File } from '@prisma/client';

@Injectable()
export class FilesystemService {
  basePath: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.basePath = this.configService.get<string>('FILESERVER_PATH');
    if (this.basePath === null) {
      this.basePath = '/';
    }
    fs.accessSync(this.basePath);
  }

  async getFileSystemInfo(name: string) {
    const allowedExtensions: string[] = [];
    const info = await this.prismaService.filesystem.findUnique({
      where: {
        name: name,
      },
      include: {
        files: true,
      },
    });
    const extensions = await this.prismaService.extension.findMany({
      where: {
        filesystemId: info.id,
      },
      select: {
        name: true,
      },
    });
    extensions.forEach((item) => allowedExtensions.push(item.name));
    const { files, ...result } = info;
    if (files.length > 0) {
      const validFiles: Pick<File, 'name' | 'size'>[] = [];
      files.forEach((item) => {
        validFiles.push({
          name: item.name,
          size: item.size,
        });
      });
      return { ...result, extensions: allowedExtensions, files: validFiles };
    }
    return { ...result, extensions: allowedExtensions, files };
  }

  async writeFile(filesystem: string, name: string, data: Buffer) {
    return new Promise<boolean>((resolve, reject) => {
      fs.writeFile(path.join(this.basePath, filesystem, name), data, (err) => {
        if (err) reject(false);
        resolve(true);
      });
    });
  }

  async checkFileExists(filesystem: string, filename: string) {
    return this.prismaService.file.findFirst({
      where: {
        filesystem: {
          name: filesystem,
        },
        name: filename,
      },
      select: {
        id: true,
        name: true,
        size: true,
      },
    });
  }

  async deleteFileFromDB(id: number) {
    return this.prismaService.file.delete({
      where: {
        id,
      },
    });
  }

  async getFileContent(filesystem: string, name: string) {
    return new Promise<boolean | Buffer>((resolve, reject) => {
      fs.readFile(path.join(this.basePath, filesystem, name), (err, data) => {
        if (err) reject(false);
        resolve(data);
      });
    });
  }

  async deleteFile(filesystem: string, name: string) {
    return new Promise<boolean>((resolve, reject) => {
      fs.rm(path.join(this.basePath, filesystem, name), (err) => {
        if (err) reject(false);
        resolve(true);
      });
    });
  }

  async addFileToDB(filesystem: string, name: string, size: number) {
    return this.prismaService.file.create({
      data: {
        name,
        size,
        filesystem: {
          connect: {
            name: filesystem,
          },
        },
      },
    });
  }

  async checkFileExtension(filesystem: string, name: string) {
    let result = false;
    const fileExtension = path.extname(name).substring(1);

    const file = await this.prismaService.filesystem.findUnique({
      where: {
        name: filesystem,
      },
      select: {
        allowedExtensions: true,
      },
    });

    file.allowedExtensions.forEach(
      ((item: Extension) => {
        if (fileExtension == item.name) result = true;
      }).bind(this.checkFileExists),
    );
    return result;
  }

  async checkFileSize(filesystem: string, name: string, size: number) {
    const file = await this.prismaService.filesystem.findUnique({
      where: {
        name: filesystem,
      },
      select: {
        maxSize: true,
      },
    });
    if (size >= file.maxSize) return false;
    return true;
  }

  checkFilesystemFolderExists(filesystem: string) {
    try {
      fs.accessSync(path.join(this.basePath, filesystem));
      return true;
    } catch (e) {
      return false;
    }
  }

  createFilesystemFolder(filesystem: string) {
    fs.mkdirSync(path.join(this.basePath, filesystem));
  }
}
