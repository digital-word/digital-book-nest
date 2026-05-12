import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';

/**
 * Common query parameters for list endpoints
 * Includes pagination, sorting, and filtering
 */
export class ListQueryDto {
  // Pagination
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? Number.parseInt(value, 10) : 1,
  )
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? Number.parseInt(value, 10) : 10,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdTime',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  // Filtering
  @ApiPropertyOptional({
    description: 'Include soft-deleted items',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  includeDeleted: boolean = false;
}
