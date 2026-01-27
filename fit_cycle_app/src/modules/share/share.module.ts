import { Module } from '@nestjs/common';
import { EntitiesModule } from '@/database/entities.module';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';

@Module({
  imports: [EntitiesModule],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
