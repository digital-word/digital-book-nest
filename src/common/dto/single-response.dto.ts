import { ApiResponse } from './base-api-response.dto';

/**
 * Single object response class
 * For endpoints that return a single item
 */
export class SingleResponse<T> extends ApiResponse<T> {
  constructor(data: T, message?: string) {
    super(true, data, message);
  }
}
