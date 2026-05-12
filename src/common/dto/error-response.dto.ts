import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from './base-api-response.dto';

/**
 * Error detail object
 */
export class ErrorDetail {
  @ApiProperty({ description: 'Error code', example: 'NOT_FOUND' })
  code!: string;

  @ApiProperty({ description: 'Error message', example: 'Resource not found' })
  message!: string;

  @ApiPropertyOptional({ description: 'Additional error details' })
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

/**
 * Error response class
 * For standardized error handling
 */
export class ErrorResponse extends ApiResponse<ErrorDetail> {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    const errorDetail = new ErrorDetail(code, message, details);
    super(false, errorDetail);
  }
}
