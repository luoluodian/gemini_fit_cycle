import { IsString } from 'class-validator';

/**
 * 导入计划请求 DTO。
 * 用于通过分享码复制他人计划到自己的账号。
 */
export class ImportPlanDto {
  /** 分享码 */
  @IsString()
  readonly shareCode!: string;
}