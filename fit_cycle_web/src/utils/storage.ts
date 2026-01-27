/**
 * 存储工具函数
 * 封装Taro的存储API，提供类型安全的存储操作
 */

import Taro from "@tarojs/taro";

/**
 * 从本地存储获取数据
 * @param key 存储键名
 * @returns 存储的数据，获取失败时返回null
 */
export function getStorage<T>(key: string): T | null {
  try {
    return Taro.getStorageSync(key) as T;
  } catch (error) {
    console.error(`获取存储失败 [${key}]:`, error);
    return null;
  }
}

/**
 * 设置本地存储数据
 * @param key 存储键名
 * @param value 要存储的数据
 */
export function setStorage(key: string, value: any): void {
  try {
    Taro.setStorageSync(key, value);
  } catch (error) {
    console.error(`存储失败 [${key}]:`, error);
  }
}

/**
 * 删除本地存储数据
 * @param key 存储键名
 */
export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(key);
  } catch (error) {
    console.error(`删除存储失败 [${key}]:`, error);
  }
}

/**
 * 清空所有本地存储
 */
export function clearStorage(): void {
  try {
    Taro.clearStorageSync();
  } catch (error) {
    console.error("清空存储失败:", error);
  }
}

/**
 * 获取存储信息
 * @returns 存储空间信息
 */
export function getStorageInfo() {
  try {
    return Taro.getStorageInfoSync();
  } catch (error) {
    console.error("获取存储信息失败:", error);
    return null;
  }
}

/**
 * 检查key是否存在
 * @param key 存储键名
 * @returns 是否存在
 */
export function hasStorage(key: string): boolean {
  try {
    const res = Taro.getStorageInfoSync();
    return res.keys.includes(key);
  } catch (error) {
    console.error(`检查存储失败 [${key}]:`, error);
    return false;
  }
}
