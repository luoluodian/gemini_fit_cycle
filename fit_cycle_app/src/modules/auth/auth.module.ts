// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

import { JwtAuthGuard } from './jwt.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';

import { EntitiesModule } from '@/database/entities.module';
import { UserModule } from '@/modules/user/user.module'; // Import UserModule

@Module({
  imports: [
    EntitiesModule,
    ConfigModule,
    UserModule, // Add UserModule here

    // 默认 JWT（Access Token）
    PassportModule.register({ defaultStrategy: 'jwt' }),


    // Access Token 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // access token 过期时间
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
  ],

  exports: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
