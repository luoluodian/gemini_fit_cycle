export const ROUTES = {
  // 核心 Tab 页面
  HOME: "/pages/index/index",
  PLAN_OVERVIEW: "/pages/plan/index",
  FOOD_LIBRARY: "/pages/food/index",
  PROFILE: "/pages/profile/index",

  // 认证与用户
  LOGIN: "/pages/login/index",
  USER_PROFILE: "/pages/user/profile/index",
  USER_SETTINGS: "/pages/user/settings/index",

  // 计划管理流程
  PLAN_CREATOR: "/pages/plan-creator/index",
  CARB_CYCLE_SETUP: "/pages/carb-cycle-setup/index",
  PLAN_TEMPLATES: "/pages/plan-templates/index",
  EDIT_TEMPLATE: "/pages/edit-template/index",
  PLAN_DETAIL: "/pages/plan-detail/index",
  MEAL_CONFIG: "/pages/meal-config/index",

  // 饮食记录与日程
  DAILY_LIST: "/pages/daily-list/index",
  DAILY_PLAN: "/pages/daily-plan/index",
  RECORD_LIST: "/pages/record/list/index",
  RECORD_DETAIL: "/pages/record/detail/index",
  RECORD_CREATE: "/pages/record/create/index",
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
