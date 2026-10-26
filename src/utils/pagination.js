const isPositiveInteger = (val) => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const num = parseInt(trimmed, 10);
  return num > 0 && String(num) === trimmed;
};

const parsePagination = (query) => {
  const { page: pageQuery, limit: limitQuery } = query;

  if (pageQuery !== undefined && !isPositiveInteger(pageQuery)) {
    return { error: 'page and limit must be positive integers' };
  }
  if (limitQuery !== undefined && !isPositiveInteger(limitQuery)) {
    return { error: 'page and limit must be positive integers' };
  }

  let page = pageQuery !== undefined ? parseInt(pageQuery, 10) : 1;
  let limit = limitQuery !== undefined ? parseInt(limitQuery, 10) : 10;
  if (limit > 50) {
    limit = 50;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const formatPaginatedResponse = (data, page, limit, total) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

module.exports = {
  isPositiveInteger,
  parsePagination,
  formatPaginatedResponse,
};
