/**
 * 统一错误处理工具
 * 提供错误分类、错误消息映射、错误提示等功能
 */

import Taro from "@tarojs/taro";
import {
  ERROR_CODES,
  getErrorMessage,
  isNetworkError,
  isTimeoutError,
} from "../constants/error-codes";

// 重新导出，方便其他模块使用
export { isNetworkError, isTimeoutError };

/**
 * 自定义API错误类
 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any,
    public config?: any
  ) {
    super(message);
    this.name = "ApiError";

    // 保持正确的错误堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * 错误分类
 */
export enum ErrorType {
  NETWORK = "NETWORK", // 网络错误
  TIMEOUT = "TIMEOUT", // 超时错误
  BUSINESS = "BUSINESS", // 业务错误
  AUTH = "AUTH", // 认证错误
  SERVER = "SERVER", // 服务器错误
  UNKNOWN = "UNKNOWN", // 未知错误
}

/**
 * 获取错误类型
 */
export function getErrorType(error: any): ErrorType {
  if (isNetworkError(error)) {
    return ErrorType.NETWORK;
  }

  if (isTimeoutError(error)) {
    return ErrorType.TIMEOUT;
  }

  if (error instanceof ApiError) {
    const code = error.code;
    if (code === ERROR_CODES.UNAUTHORIZED) {
      return ErrorType.AUTH;
    }
    if (code >= 400 && code < 500) {
      return ErrorType.BUSINESS;
    }
    if (code >= 500) {
      return ErrorType.SERVER;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * 显示错误提示
 */
export function showErrorToast(message: string, code?: number): void {
  try {
    Taro.showToast({
      title: message,
      icon: "none",
      duration: 2000,
    });
  } catch (error) {
    console.error("显示提示失败:", error);
  }
}

/**
 * 统一API错误处理
 */
export function handleApiError(error: ApiError): void {
  const errorType = getErrorType(error);

  switch (errorType) {
    case ErrorType.AUTH:
      // 认证错误 - 跳转登录
      handleAuthError(error);
      break;

    case ErrorType.NETWORK:
      // 网络错误
      handleNetworkError(error);
      break;

    case ErrorType.TIMEOUT:
      // 超时错误
      handleTimeoutError(error);
      break;

    case ErrorType.BUSINESS:
      // 业务错误
      handleBusinessError(error);
      break;

    case ErrorType.SERVER:
      // 服务器错误
      handleServerError(error);
      break;

    default:
      // 未知错误
      handleUnknownError(error);
  }
}

/**
 * 处理认证错误
 */
function handleAuthError(error: ApiError): void {
  // 清除登录信息
  // 跳转登录页面
  // 显示登录提示
  showErrorToast(error.message || "登录已过期，请重新登录");
}

/**
 * 处理网络错误
 */
function handleNetworkError(error: ApiError): void {
  showErrorToast("网络连接失败，请检查网络后重试");
}

/**
 * 处理超时错误
 */
function handleTimeoutError(error: ApiError): void {
  showErrorToast("请求超时，请稍后重试");
}

/**
 * 处理业务错误
 */
function handleBusinessError(error: ApiError): void {
  // 业务错误显示具体错误信息
  if (error.message) {
    showErrorToast(error.message, error.code);
  }
}

/**
 * 处理服务器错误
 */
function handleServerError(error: ApiError): void {
  showErrorToast("服务器繁忙，请稍后再试");
}

/**
 * 处理未知错误
 */
function handleUnknownError(error: ApiError): void {
  console.error("未知错误:", error);
  showErrorToast("系统异常，请稍后重试");
}

/**
 * 创建API错误
 */
export function createApiError(
  code: number,
  message?: string,
  data?: any,
  config?: any
): ApiError {
  const errorMessage = getErrorMessage(code, message);
  return new ApiError(code, errorMessage, data, config);
}
