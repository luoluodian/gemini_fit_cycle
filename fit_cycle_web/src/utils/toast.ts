/**
 * Toast提示工具
 * 统一封装Taro的showToast方法，提供常用的提示功能
 */

import Taro from "@tarojs/taro";

/**
 * Toast配置接口
 */
interface ToastOptions {
  title: string;
  icon?: "success" | "error" | "loading" | "none";
  duration?: number;
  mask?: boolean;
}

/**
 * 基础Toast方法
 */
export function showToast(options: ToastOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      Taro.showToast({
        title: options.title,
        icon: options.icon || "none",
        duration: options.duration || 2000,
        mask: options.mask || false,
        success: () => resolve(),
        fail: (error) => reject(error),
      });
    } catch (error) {
      console.error("Toast显示失败:", error);
      reject(error);
    }
  });
}

/**
 * 成功提示
 */
export function showSuccess(
  title: string,
  duration: number = 2000
): Promise<void> {
  return showToast({
    title,
    icon: "success",
    duration,
  });
}

/**
 * 错误提示
 */
export function showError(
  title: string,
  duration: number = 2000
): Promise<void> {
  return showToast({
    title,
    icon: "none",
    duration,
  });
}

/**
 * 加载提示
 * 注意：loading提示不会自动关闭，需要手动调用hideToast()关闭
 */
export function showLoading(
  title: string = "加载中...",
  mask: boolean = true
): Promise<void> {
  return showToast({
    title,
    icon: "loading",
    duration: 60000, // 1分钟，避免自动关闭（通常需要手动调用hideToast关闭）
    mask,
  });
}

/**
 * 关闭Toast
 */
export function hideToast(): void {
  try {
    Taro.hideToast();
  } catch (error) {
    console.error("关闭Toast失败:", error);
  }
}

/**
 * 模态对话框
 */
export function showModal(options: {
  title?: string;
  content: string;
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    Taro.showModal({
      title: options.title || "提示",
      content: options.content,
      showCancel: options.showCancel !== false,
      cancelText: options.cancelText || "取消",
      confirmText: options.confirmText || "确定",
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      },
    });
  });
}
