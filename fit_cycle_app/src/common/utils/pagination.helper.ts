// 分页工具函数
export function applyPagination(qb, query: any) {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  const skip = (page - 1) * pageSize;

  qb.skip(skip).take(pageSize);

  return { page, pageSize };
}
