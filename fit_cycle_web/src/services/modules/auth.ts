import { httpRequest } from '@/services/http';

/**
 * 用户信息接口定义（对齐后端 UserResponseDto）
 */
export interface UserInfo {
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
 * 登录响应定义
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: UserInfo;
}

/**
 * 微信登录
 * @param code 微信 login 接口返回的 code
 */
export const login = (code: string) => {
  return httpRequest.post<AuthResponse>('/auth/wechatAuth', { code });
};
