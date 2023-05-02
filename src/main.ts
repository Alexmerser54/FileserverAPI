import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const prismaSerivce = await app.get(PrismaService);
  // const routes = await prismaSerivce.filesystem.findMany({
  //   select: {
  //     name: true,
  //   },
  // });
  // console.log(routes);
  // fs.writeFileSync('/routes.json', JSON.stringify(routes));
  // console.log('Write file');
  await app.listen(3000);
}
bootstrap();
