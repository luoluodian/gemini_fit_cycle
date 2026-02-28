import { httpRequest } from "../http";

export interface DictItem {
  id: number;
  category: string;
  code: string;
  value: number;
  text: string;
  description?: string;
  extInfo?: any;
}

/**
 * 获取某个分类下的字典项
 */
export async function getDictByCategory(category: string): Promise<DictItem[]> {
  return httpRequest.get(`/dict/${category}`);
}
