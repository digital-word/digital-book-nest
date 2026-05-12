import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from './base-api-response.dto';
import { Pagination } from './pagination.dto';

/**
 * List response class (always paginated)
 * For endpoints that return arrays/collections
 */
export class ListResponse<T> extends ApiResponse<T[]> {
  @ApiProperty({ description: 'Pagination information', type: Pagination })
  pagination!: Pagination;

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ) {
    super(true, data, message);
    this.pagination = new Pagination(page, limit, total);
  }
}
