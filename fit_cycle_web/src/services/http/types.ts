/**
 * HTTP相关类型定义
 * 定义请求、响应、配置等相关类型
 */

import type Taro from "@tarojs/taro";

/**
 * API响应数据结构
 */
export interface ApiResponse<T = unknown> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
}

/**
 * 请求配置接口
 */
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  enableAutoLogin?: boolean;
  showErrorToast?: boolean;
  _isRetry?: boolean;
}

/**
 * 请求选项(合并Taro原生配置)
 */
export type RequestOptions = Taro.request.Option & RequestConfig;

/**
 * 上传配置
 */
export interface UploadConfig extends RequestConfig {
  name?: string;
  formData?: any;
}

/**
 * 拦截器接口
 */
export interface Interceptor {
  /**
   * 请求拦截器
   * 在请求发送前执行，可以修改请求配置
   */
  beforeRequest?(
    config: RequestOptions
  ): Promise<RequestOptions> | RequestOptions;

  /**
   * 响应拦截器
   * 在收到响应后执行，可以修改响应数据
   */
  afterResponse?<T>(
    response: ApiResponse<T>
  ): Promise<ApiResponse<T>> | ApiResponse<T>;

  /**
   * 错误拦截器
   * 在发生错误时执行，可以处理或转换错误
   */
  onError?(error: any): Promise<any> | any;
}

/**
 * HTTP方法类型
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "TRACE"
  | "CONNECT";

/**
 * 请求结果类型
 */
export type ApiResult<T> = Promise<T>;

/**
 * 错误响应类型
 */
export interface ErrorResponse {
  code: number;
  message: string;
  data?: any;
}

/**
 * 分页响应数据
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
}

/**
 * 分页请求参数
 */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: "asc" | "desc";
}
