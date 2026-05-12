import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base response class
 * All API responses follow this structure
 */
export class ApiResponse<T> {
  @ApiProperty({ description: 'Success status', example: true })
  success!: boolean;

  @ApiProperty({ description: 'Response data' })
  data!: T;

  @ApiPropertyOptional({ description: 'Optional message' })
  message?: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2026-05-08T10:00:00.000Z',
  })
  timestamp!: string;

  constructor(success: boolean, data: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}
