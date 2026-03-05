import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivationService } from './activation.service';
import { ActivationController } from './activation.controller';
import { ActivationCode } from '../../database/entity/activation-code.entity';
import { User } from '../../database/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivationCode, User])],
  providers: [ActivationService],
  controllers: [ActivationController],
})
export class ActivationModule {}
