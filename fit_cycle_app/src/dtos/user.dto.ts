import {
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 微信授权登录 DTO
 * 用于 /auth/wechatAuth
 */
export class WechatAuthDto {
  /** login() 获取的 code */
  @IsString()
  code: string;

  /**
   * 第一步：获取用户基本资料（昵称头像）
   */
  @IsOptional()
  @IsString()
  rawData?: string;

  @IsOptional()
  @IsString()
  encryptedDataProfile?: string;

  @IsOptional()
  @IsString()
  ivProfile?: string;

  @IsOptional()
  @IsString()
  signature?: string;

  /**
   * 第二步：获取手机号
   */
  @IsOptional()
  @IsString()
  encryptedDataPhone?: string;

  @IsOptional()
  @IsString()
  ivPhone?: string;
}

/**
 * 后端返回给前端的用户信息 (契约对齐：嵌套格式)
 */
export class UserResponseDto {
  user: {
    id: number;
    nickname?: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
    isCompleted?: boolean;
  };

  health: {
    genderId?: number;
    genderText?: string;
    heightCm?: number;
    weightKg?: number;
    dateOfBirth?: string;
    activityLevelId?: number;
    activityLevelText?: string;
    bmr?: number;
    tdee?: number;
  };

  stats: {
    totalDays: number;
    completedPlans: number;
  };
}

/**
 * 更新用户资料 DTO（填写资料页）
 * 前端表单提交的数据需要转换为 number
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string; // YYYY-MM-DD

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetWeightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  goalRate?: number;

  /** 性别 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genderId?: number;

  @IsOptional()
  @IsString()
  genderText?: string;

  /** 活动水平 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activityLevelId?: number;

  @IsOptional()
  @IsString()
  activityLevelText?: string;

  /** 目标类型 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  goalTypeId?: number;

  @IsOptional()
  @IsString()
  goalTypeText?: string;
}

// 刷新 token
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
