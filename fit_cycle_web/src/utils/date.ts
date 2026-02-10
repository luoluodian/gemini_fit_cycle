/**
 * 日期处理工具类
 * 全链路统一使用 YYYY-MM-DD 字符串作为业务契约
 */

/**
 * 将 Date 对象格式化为 YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 获取今日日期的 YYYY-MM-DD 字符串
 */
export const getTodayString = (): string => {
  return formatDate(new Date());
};

/**
 * 对 YYYY-MM-DD 字符串进行天数加减
 */
export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

/**
 * 获取友好日期展示 (如：2026年2月9日)
 */
export const getDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};
