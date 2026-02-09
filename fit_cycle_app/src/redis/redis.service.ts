import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Redis, { RedisOptions } from 'ioredis';

/**
 * Redis 服务封装。负责创建和管理 Redis 客户端实例，
 * 提供常用的 get/set 方法，方便业务层使用。
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  /** Redis 客户端实例 */
  private client: Redis;
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Nest 生命周期钩子：模块初始化时创建 Redis 连接
   */
  onModuleInit() {
    const options: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      // 🔥 增强远程连接稳定性
      connectTimeout: 10000, // 10s 连接超时
      maxRetriesPerRequest: 3, // 限制单次请求重试，防止死循环
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        return delay; // 指数退避重连
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) return true;
        return false;
      },
    };
    this.client = new Redis(options);
    this.client.on('error', (err) => {
      this.logger.log({ level: 'error', message: 'Redis连接错误', error: String(err) });
    });
    this.client.on('ready', () => {
      this.logger.log({
        level: 'info',
        message: 'Redis连接就绪',
        host: options.host,
        port: options.port,
      });
    });
  }

  /** Nest 生命周期钩子：模块销毁时关闭 Redis 连接 */
  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  /** 从 Redis 中读取值 */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * 写入字符串值到 Redis
   * @param key 键
   * @param value 值
   * @param expire 过期秒数，可选
   */
  async set(key: string, value: string, expire?: number): Promise<void> {
    if (expire && expire > 0) {
      await this.client.set(key, value, 'EX', expire);
    } else {
      await this.client.set(key, value);
    }
  }
}
