/**
 * 1. Global base response interface
 * All API responses should follow this structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 2. Pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 3. Single object response interface
 * For endpoints that return a single item
 */
export interface SingleResponse<T> extends ApiResponse<T> {
  data: T;
}

/**
 * 4. List response interface (always paginated)
 * For endpoints that return arrays/collections
 */
export interface ListResponse<T> extends ApiResponse<T[]> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Error response interface
 * For standardized error handling
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
