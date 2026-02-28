/**
 * 单位显示转换工具
 * 确保界面展示不出现英文单位
 */

const UNIT_MAP: Record<string, string> = {
  'g': 'g',
  'ml': 'ml',
  'kg': 'kg',
  'l': '升',
  'kcal': 'kcal',
  'kcal/100g': 'kcal/100g',
  'piece': '个',
  'bar': '根/条',
  'scoop': '勺',
  'cup': '杯',
  'tbsp': '大勺',
};

/**
 * 获取展示用单位
 * @param unit 原始单位标识
 */
export const displayUnit = (unit: string): string => {
  if (!unit) return "";
  return UNIT_MAP[unit] || unit;
};
