import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ActivationCode } from '../../database/entity/activation-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivationCode])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
