/**
 * 用户服务
 * 提供用户相关的API接口调用
 */

import { httpRequest } from "../http";

/**
 * 用户登录参数
 */
export interface LoginParams {
  code?: string;
  phone?: string;
  password?: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number;
  nickname: string;
  avatarUrl: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

/**
 * 登录/刷新响应
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

/**
 * 刷新用户Token
 */
export async function refreshToken(token: string): Promise<AuthResponse> {
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
