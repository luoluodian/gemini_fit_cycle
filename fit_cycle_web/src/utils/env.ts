/**
 * 环境变量工具类
 * 提供跨平台的环境变量访问，解决 process.env 在微信小程序中不可用的问题
 */
import Taro from "@tarojs/taro";

/**
 * 获取当前平台
 * @returns 平台标识字符串
 */
export function getCurrentPlatform(): string {
  try {
    return Taro.getEnv();
  } catch (error) {
    return "unknown";
  }
}

/**
 * 获取环境模式（development 或 production）
 * @returns 环境模式字符串
 */
export function getEnvMode(): string {
  // #ifdef NODE_ENV=development
  return "development";
  // #endif
  // #ifdef NODE_ENV=production
  return "production";
  // #endif
  // 默认返回开发环境（更安全）
  return "development";
}

/**
 * 是否是开发环境
 * @returns 是否为开发环境
 */
export function isDevelopment(): boolean {
  return getEnvMode() === "development";
}

/**
 * 是否是生产环境
 * @returns 是否为生产环境
 */
export function isProduction(): boolean {
  return getEnvMode() === "production";
}

/**
 * 是否是 H5 环境
 * @returns 是否为 H5 环境
 */
export function isH5(): boolean {
  try {
    return Taro.getEnv() === Taro.ENV_TYPE.WEB;
  } catch (error) {
    return false;
  }
}

/**
 * 是否是小程序环境
 * @returns 是否为小程序环境
 */
export function isMiniProgram(): boolean {
  try {
    const env = Taro.getEnv();
    return (
      env === Taro.ENV_TYPE.WEAPP ||
      env === Taro.ENV_TYPE.SWAN ||
      env === Taro.ENV_TYPE.ALIPAY ||
      env === Taro.ENV_TYPE.TT
    );
  } catch (error) {
    return false;
  }
}

/**
 * 获取 API 基础 URL
 * @returns API 基础 URL 字符串
 */
export function getApiBaseUrl(): string {
  // H5 环境使用相对路径，方便开发环境的代理
  if (isH5()) {
    return "/api";
  }

  // 开发环境
  if (isDevelopment()) {
    return "https://dev-api.fit-cycle.com";
  }

  // 生产环境
  return "https://api.fit-cycle.com";
}

/**
 * 是否启用日志输出
 * @returns 是否启用日志
 */
export function isLogEnabled(): boolean {
  // 开发环境默认启用日志
  if (isDevelopment()) {
    return true;
  }

  // 生产环境可以通过特定方式开启调试模式（仅 H5）
  if (isH5() && typeof window !== "undefined") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("debug") === "true";
    } catch (error) {
      return false;
    }
  }

  return false;
}

