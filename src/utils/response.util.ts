/**
 * Standard success response format
 */
export const successResponse = <T>(data: T, meta?: any) => {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
};

/**
 * Standard error response format
 */
export const errorResponse = (code: string, message: string, details?: any) => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
};

/**
 * Pagination metadata helper
 */
export const paginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
