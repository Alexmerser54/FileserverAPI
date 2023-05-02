import { DynamicModule, Module } from '@nestjs/common';
import { getControllerClass } from './filesystem.controller';
import { FilesystemService } from './filesystem.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
@Module({
  providers: [PrismaService],
})
export class FilesystemModule {
  static async forRoot(): Promise<DynamicModule> {
    const MyControllers = [];
    const prisma = new PrismaService();
    await prisma.$connect();

    const routeNames = await prisma.filesystem.findMany({
      select: {
        name: true,
      },
    });

    routeNames.forEach((item) =>
      MyControllers.push(getControllerClass(item.name)),
    );

    await prisma.$disconnect;
    return {
      module: FilesystemModule,
      imports: [ConfigModule, JwtModule],
      providers: [FilesystemService, PrismaService, ConfigService],
      exports: [FilesystemService],
      controllers: MyControllers,
    };
  }
}
