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
 * 获取用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
  return httpRequest.get("/user/info");
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return httpRequest.put("/user/info", data);
}

/**
 * 用户退出登录
 */
export async function logout(): Promise<void> {
  return httpRequest.post("/auth/logout");
}