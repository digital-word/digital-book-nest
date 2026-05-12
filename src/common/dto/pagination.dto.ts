import { ApiProperty } from '@nestjs/swagger';

/**
 * Pagination information included in list responses
 */
export class Pagination {
  @ApiProperty({ description: 'Current page number', example: 1, default: 1 })
  page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  limit!: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total!: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages!: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNext!: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrevious!: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}
