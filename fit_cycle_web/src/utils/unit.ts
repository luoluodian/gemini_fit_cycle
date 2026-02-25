/**
 * 单位显示转换工具
 * 确保界面展示不出现英文单位
 */

const UNIT_MAP: Record<string, string> = {
  'g': 'g',
  'ml': 'ml',
  'kg': 'kg',
  'kcal': 'kcal',
  'kcal/100g': 'kcal/100g',
  'piece': '个',
  'cup': '杯',
  'tbsp': '勺',
};

/**
 * 获取展示用单位
 * @param unit 原始单位标识
 */
export const displayUnit = (unit: string): string => {
  if (!unit) return "";
  return UNIT_MAP[unit] || unit;
};
