import { useRouter } from "@tarojs/taro";

/**
 * 获取页面参数 - 这是唯一需要封装的钩子
 */
export function useRouterParams<T = Record<string, any>>(): T {
  const router = useRouter();
  return (router.params || {}) as T;
}
