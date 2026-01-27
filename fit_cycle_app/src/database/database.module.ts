import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const syncEnv = config.get<string>('DB_SYNC');
        const isProd = config.get<string>('NODE_ENV') === 'production';
        return {
          type: 'mysql',
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: syncEnv === 'true' && !isProd, // 生产环境始终禁用

          // ======================
          // 🔥 连接池配置（推荐）
          // ======================
          extra: {
            connectionLimit: 20, // 最大连接数
            waitForConnections: true, // 等待可用连接
            queueLimit: 0, // 不限制排队数量
          },

          // ======================
          // 🔥 超时设置（防止 ETIMEDOUT）
          // ======================
          connectTimeout: 15000, // 15 秒连接超时

          // 保活（避免 MySQL 自动断开 idle 连接）
          keepConnectionAlive: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
