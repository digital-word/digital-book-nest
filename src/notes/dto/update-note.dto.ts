import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NoteStatus, NotePermission } from '../interfaces/note.interface';
import { ContentDto } from './content.dto';

export class UpdateNoteDto {
  @ApiPropertyOptional({
    description: 'Note title',
    example: 'Updated Note Title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Rich text content in Quill Delta format',
    type: () => ContentDto,
    example: { ops: [{ insert: 'Updated content\n' }] },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContentDto)
  content?: ContentDto;

  @ApiPropertyOptional({
    description: 'Array of tags',
    example: ['typescript', 'nestjs'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Note category', example: 'Development' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Mark as favorite', example: true })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Note status',
    enum: NoteStatus,
    enumName: 'NoteStatus',
  })
  @IsOptional()
  @IsEnum(NoteStatus)
  status?: NoteStatus;

  @ApiPropertyOptional({
    description: 'Permission level',
    enum: NotePermission,
    enumName: 'NotePermission',
  })
  @IsOptional()
  @IsEnum(NotePermission)
  permissions?: NotePermission;

  @ApiPropertyOptional({ description: 'Soft delete flag', example: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({ description: 'Deletion timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedTime?: Date;

  @ApiPropertyOptional({
    description: 'Array of user IDs to share with',
    example: ['user456', 'user789'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWith?: string[];
}
