import Taro from "@tarojs/taro";

/**
 * 获取当前页面路径
 */
export function getCurrentPagePath(): string {
  const pages = Taro.getCurrentPages();
  return pages[pages.length - 1]?.route || "";
}
