/**
 * API错误码配置
 * 定义系统可能出现的错误代码及对应的处理逻辑
 */

// 基础错误码
export const ERROR_CODES = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  TOO_MANY_REQUESTS: 429,
} as const;

// 错误码类型
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// 错误消息映射
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.SUCCESS]: "操作成功",
  [ERROR_CODES.UNAUTHORIZED]: "登录已过期，请重新登录",
  [ERROR_CODES.FORBIDDEN]: "权限不足",
  [ERROR_CODES.NOT_FOUND]: "资源不存在",
  [ERROR_CODES.SERVER_ERROR]: "服务器错误",
  [ERROR_CODES.BAD_REQUEST]: "请求参数错误",
  [ERROR_CODES.TOO_MANY_REQUESTS]: "请求过于频繁，请稍后再试",
};

/**
 * 获取错误消息
 */
export function getErrorMessage(code: number, defaultMsg?: string): string {
  return ERROR_MESSAGES[code as ErrorCode] || defaultMsg || "未知错误";
}

/**
 * 判断是否需要重新登录
 */
export function needReLogin(code: number): boolean {
  return code === ERROR_CODES.UNAUTHORIZED;
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: any): boolean {
  return error?.errMsg?.includes("request:fail");
}

/**
 * 判断是否为超时错误
 */
export function isTimeoutError(error: any): boolean {
  return error?.errMsg?.includes("timeout");
}
