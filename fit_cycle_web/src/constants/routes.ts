export const ROUTES = {
  // 首页
  HOME: "/pages/index/index",

  // 登录相关
  LOGIN: "/pages/login/index",
  // 计划相关
  PLAN_OVERVIEW: "/pages/plan/index",
  DAILY_LIST: "/pages/daily-list/index",

  // 用户相关
  USER_PROFILE: "/pages/user/profile/index",
  USER_SETTINGS: "/pages/user/settings/index",

  // 记录相关
  RECORD_LIST: "/pages/record/list/index",
  RECORD_DETAIL: "/pages/record/detail/index",
  RECORD_CREATE: "/pages/record/create/index",

  // 其他页面...
} as const;

// 使用 typeof 获取更精确的类型约束
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * 不需要登录即可访问的页面白名单
 */
export const PUBLIC_PAGES: string[] = [
  ROUTES.LOGIN,
];

/**
 * 判断是否为公共页面
 */
export function isPublicPage(path: string): boolean {
  // 移除开头和结尾的斜杠以及查询参数进行比较
  const cleanPath = path.split('?')[0].replace(/^\/|\/$/g, '');
  return PUBLIC_PAGES.some(publicPath => 
    publicPath.replace(/^\/|\/$/g, '') === cleanPath
  );
}
