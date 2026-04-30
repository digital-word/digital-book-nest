import { Transform } from 'class-transformer';

/**
 * Common query parameters for list endpoints
 * Includes pagination, sorting, and filtering
 */
export class ListQueryDto {
  // Pagination
  @Transform(({ value }: { value: string }) =>
    value ? Number.parseInt(value, 10) : 1,
  )
  page: number = 1;

  @Transform(({ value }: { value: string }) =>
    value ? Number.parseInt(value, 10) : 10,
  )
  limit: number = 10;

  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' = 'desc';

  // Filtering
  @Transform(({ value }: { value: string }) => value === 'true')
  includeDeleted: boolean = false;
}
