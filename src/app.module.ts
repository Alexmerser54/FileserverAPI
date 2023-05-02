import { Module } from '@nestjs/common';
import { FilesystemModule } from './filesystem/filesystem.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FilesystemModule.forRoot(), AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
