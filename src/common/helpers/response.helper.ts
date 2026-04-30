import {
  SingleResponse,
  ListResponse,
  PaginationMeta,
  ErrorResponse,
} from '../dto/api-response.dto';

/**
 * Helper functions to create standardized API responses
 */

/**
 * Create a successful single item response
 */
export function createSingleResponse<T>(
  data: T,
  message?: string,
): SingleResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a paginated list response
 * All lists should include pagination
 */
export function createListResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): ListResponse<T> {
  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1,
  };

  return {
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
