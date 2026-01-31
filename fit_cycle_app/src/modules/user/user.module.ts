import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../database/entity/user.entity';
import { HealthProfile } from '@/database/entity/health-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, HealthProfile])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Export UserService to be used by other modules (e.g., AuthModule)
})
export class UserModule {}