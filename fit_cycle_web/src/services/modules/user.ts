/**
 * 用户服务
 * 提供用户相关的API接口调用
 */

import { httpRequest } from "../http";
import type { UserInfo, AuthResponse } from "./auth";

/**
 * 重新导出类型，方便其他模块使用
 */
export type { UserInfo, AuthResponse };

/**
 * 健康档案
 */
export interface HealthProfile {
  id: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  birthday: string;
  activityLevel: number;
  bmr: number;
  tdee: number;
}

/**
 * 用户统计数据
 */
export interface UserStats {
  totalDays: number;
  completedPlans: number;
}

/**
 * 用户完整档案响应
 */
export interface UserProfileResponse {
  user: UserInfo;
  health: HealthProfile;
  stats: UserStats;
}

/**
 * 用户登录参数
 */
export interface LoginParams {
  code?: string;
  phone?: string;
  password?: string;
}

/**
 * 刷新用户Token
 * 注意：后端此接口仅返回 accessToken 和 refreshToken，不包含 user 信息
 */
export async function refreshToken(token: string): Promise<Omit<AuthResponse, 'user'>> {
  return httpRequest.post("/auth/refreshToken", {
    refreshToken: token,
  });
}

/**
 * 获取用户信息 (旧接口，建议迁移到 getUserProfile)
 */
export async function getUserInfo(): Promise<UserInfo> {
  return httpRequest.get("/user/profile");
}

/**
 * 获取用户完整档案 (包含健康数据和统计)
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  return httpRequest.get("/user/profile");
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return httpRequest.put("/user/profile", data);
}

/**
 * 更新健康档案 (专用于 BMR/TDEE 相关数据)
 */
export async function updateHealthProfile(data: Partial<UserInfo>): Promise<{ bmr: number, tdee: number }> {
  return httpRequest.put("/user/health-profile", data);
}

/**
 * 用户退出登录
 */
export async function logout(): Promise<void> {
  return httpRequest.post("/auth/logout");
}