import { IsString } from 'class-validator';

/**
 * 登录请求 DTO：小程序登录时提交的授权码。
 */
export class AuthLoginDto {
  @IsString()
  readonly code!: string;
}
