/**
 * HTTP请求管理器
 * 基于拦截器模式的核心请求管理器
 */

import Taro from "@tarojs/taro";
import {
  ApiResponse,
  RequestOptions,
  RequestConfig,
  Interceptor,
  ApiResult,
  UploadConfig,
} from "./types";
import { ERROR_CODES, API_BASE_CONFIG, getFullUrl } from "../../constants";
import { createApiError } from "../../utils/error-handler";

/**
 * 请求管理器配置
 */
interface RequestManagerConfig {
  interceptors?: Interceptor[];
}

/**
 * HTTP请求管理器
 */
export class RequestManager {
  private interceptors: Interceptor[] = [];

  constructor(config: RequestManagerConfig = {}) {
    this.interceptors = config.interceptors || [];
  }

  /**
   * 添加拦截器
   */
  addInterceptor(interceptor: Interceptor): void {
    this.interceptors.push(interceptor);
  }

  /**
   * 移除拦截器
   */
  removeInterceptor(interceptor: Interceptor): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
    }
  }

  /**
   * 执行请求拦截器链
   */
  private async executeRequestInterceptors(
    config: RequestOptions
  ): Promise<RequestOptions> {
    let currentConfig = config;

    for (const interceptor of this.interceptors) {
      if (interceptor.beforeRequest) {
        currentConfig = await interceptor.beforeRequest(currentConfig);
      }
    }

    return currentConfig;
  }

  /**
   * 执行响应拦截器链
   */
  private async executeResponseInterceptors<T>(
    response: ApiResponse<T>
  ): Promise<ApiResponse<T>> {
    let currentResponse = response;

    for (const interceptor of this.interceptors) {
      if (interceptor.afterResponse) {
        currentResponse = await interceptor.afterResponse(currentResponse);
      }
    }

    return currentResponse;
  }

  /**
   * 执行错误拦截器链
   */
  private async executeErrorInterceptors(error: any): Promise<any> {
    let currentError = error;

    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        try {
          currentError = await interceptor.onError(currentError);
        } catch (interceptorError) {
          currentError = interceptorError;
        }
      }
    }

    throw currentError;
  }

  /**
   * 基础请求方法
   */
  async request<T = any>(options: RequestOptions): ApiResult<T> {
    const config = { ...API_BASE_CONFIG, ...options };

    try {
      // 执行请求拦截器
      const finalConfig = await this.executeRequestInterceptors(config);

      // 发送请求
      const response = await Taro.request(finalConfig);
      const data = response.data as ApiResponse<T>;

      // 检查业务状态码
      if (data.code !== ERROR_CODES.SUCCESS) {
        throw createApiError(data.code, data.message, data.data, finalConfig);
      }

      // 执行响应拦截器
      const finalResponse = await this.executeResponseInterceptors(data);

      return finalResponse.data;
    } catch (error: any) {
      // 执行错误拦截器
      try {
        await this.executeErrorInterceptors(error);
      } catch (handledError: any) {
        // 如果错误拦截器设置了重试标志（如Token刷新后），则重试请求
        if (handledError?.config?._isRetry && handledError.config) {
          // 移除重试标志，避免无限重试
          const retryConfig = { ...handledError.config };
          delete retryConfig._isRetry;
          // 重新执行请求
          return this.request<T>(retryConfig);
        }
        // 否则抛出错误
        throw handledError;
      }
      // 不应该执行到这里，但为了通过TypeScript检查
      throw error;
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(
    url: string,
    params?: any,
    config: RequestConfig = {}
  ): ApiResult<T> {
    let fullUrl = url;
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");
      fullUrl += (url.includes("?") ? "&" : "?") + queryString;
    }

    return this.request<T>({
      url: getFullUrl(fullUrl),
      method: "GET",
      ...config,
    });
  }

  /**
   * POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): ApiResult<T> {
    return this.request<T>({
      url: getFullUrl(url),
      method: "POST",
      data,
      ...config,
    });
  }

  /**
   * PUT请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): ApiResult<T> {
    return this.request<T>({
      url: getFullUrl(url),
      method: "PUT",
      data,
      ...config,
    });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config: RequestConfig = {}): ApiResult<T> {
    return this.request<T>({
      url: getFullUrl(url),
      method: "DELETE",
      ...config,
    });
  }

  /**
   * 文件上传
   */
  async upload<T = any>(
    url: string,
    filePath: string,
    formData?: any,
    config: UploadConfig = {}
  ): ApiResult<T> {
    return new Promise((resolve, reject) => {
      const uploadConfig: Taro.uploadFile.Option = {
        url: getFullUrl(url),
        filePath,
        name: config.name || "file",
        formData,
        header: {
          ...config.headers,
        },
        success: (response) => {
          try {
            const apiResponse = JSON.parse(response.data) as ApiResponse<T>;
            if (apiResponse.code !== ERROR_CODES.SUCCESS) {
              reject(createApiError(apiResponse.code, apiResponse.message));
            } else {
              resolve(apiResponse.data);
            }
          } catch (error) {
            reject(
              createApiError(ERROR_CODES.SERVER_ERROR, "解析响应数据失败")
            );
          }
        },
        fail: (error) => {
          reject(error);
        },
      };

      Taro.uploadFile(uploadConfig);
    });
  }
}

