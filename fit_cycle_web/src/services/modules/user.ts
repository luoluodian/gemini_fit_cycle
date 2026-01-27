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
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email?: string;
  [key: string]: any;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string;
  userRefToken: string;
  userInfo: UserInfo;
}

/**
 * 用户登录
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  return httpRequest.post("/api/user/login", params);
}

/**
 * 刷新用户Token
 */
export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  return httpRequest.post("/api/user/refresh-token", {
    userRefToken: refreshToken,
  });
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
  return httpRequest.get("/api/user/info");
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return httpRequest.put("/api/user/info", data);
}

/**
 * 获取用户配置
 */
export async function getUserConfig(): Promise<Record<string, any>> {
  return httpRequest.get("/api/user/config");
}

/**
 * 更新用户配置
 */
export async function updateUserConfig(
  config: Record<string, any>
): Promise<Record<string, any>> {
  return httpRequest.put("/api/user/config", config);
}

/**
 * 检查登录状态
 */
export async function checkLoginStatus(): Promise<boolean> {
  try {
    await httpRequest.get("/api/user/check-login", null, {
      showErrorToast: false,
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 用户退出登录
 */
export async function logout(): Promise<void> {
  return httpRequest.post("/api/user/logout");
}

/**
 * @deprecated 使用 refreshToken 替代
 * 刷新用户Token（保持向后兼容）
 */
export const userRefToken = refreshToken;
