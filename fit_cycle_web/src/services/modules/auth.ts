import { httpRequest } from '@/services/http';

export interface UserInfo {
  id: number;
  nickname: string;
  avatarUrl: string;
  // Add other user fields as needed
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserInfo;
}

export const login = (code: string) => {
  return httpRequest.post<AuthResponse>('/auth/wechatAuth', { code });
};