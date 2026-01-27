import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: existsSync(join(process.cwd(), '.env')) ? '.env' : undefined, // 如果 .env 文件存在则使用，否则忽略
      ignoreEnvFile: !existsSync(join(process.cwd(), '.env')), // 如果 .env 不存在，则忽略文件（使用系统环境变量）
    }),
  ],
})
export class AppConfigModule {}
