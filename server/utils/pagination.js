/**
 * Pagination utility for consistent pagination across the API
 */

/**
 * Parse and validate pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} Validated pagination parameters
 */
export const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  
  // Validate parameters
  if (page < 1) {
    throw new Error('Page must be greater than or equal to 1');
  }
  
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }
  
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * Generate pagination metadata for response
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
export const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: page,
    pageSize: limit,
    totalPages,
    totalItems: total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

/**
 * Format paginated response
 * @param {Array} data - Data items for current page
 * @param {Object} paginationMeta - Pagination metadata
 * @returns {Object} Formatted response object
 */
export const paginatedResponse = (data, paginationMeta) => {
  return {
    success: true,
    data,
    pagination: paginationMeta,
  };
};
