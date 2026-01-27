// src/common/logger/logger.module.ts
import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      // ✅ 全局 Winston logger 实例
      transports: [
        // 控制台输出
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const extra = Object.keys(meta).length
                ? ' ' + JSON.stringify(meta)
                : '';
              return `${timestamp} [${level}] ${message}${extra}`;
            }),
          ),
        }),
        // info 级别文件日志
        new (winston.transports as any).DailyRotateFile({
          dirname: 'logs/info',
          filename: 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          maxFiles: '30d',
          zippedArchive: false,
          // format: winston.format.combine(
          //   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
          //   winston.format((info) => {
          //     const { timestamp, level, message, ...rest } = info;
          //     return {
          //       timestamp,
          //       level,
          //       message,
          //       ...rest,
          //     };
          //   })(),
          //   winston.format.json(),
          // ),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const extra = Object.keys(meta).length
                ? ' ' + JSON.stringify(meta)
                : '';
              return `${timestamp} [${level}] ${message}${extra}`;
            }),
          ),
        }),
        // error 级别文件日志
        new (winston.transports as any).DailyRotateFile({
          dirname: 'logs/error',
          filename: 'app-%DATE%.error.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          zippedArchive: false,
          // format: winston.format.combine(
          //   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
          //   winston.format((info) => {
          //     const { timestamp, level, message, ...rest } = info;
          //     return { timestamp, level, message, ...rest };
          //   })(),
          //   winston.format.json(),
          // ),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const extra = Object.keys(meta).length
                ? ' ' + JSON.stringify(meta)
                : '';
              return `${timestamp} [${level}] ${message}${extra}`;
            }),
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
