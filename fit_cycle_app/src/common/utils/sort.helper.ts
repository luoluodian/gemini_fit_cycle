export function applySorting(qb, query, allowedFields) {
  const alias = qb.alias; // 自动获取别名
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'id';
  const order = query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  qb.orderBy(`${alias}.${sortBy}`, order);
}
