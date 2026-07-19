import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
} from 'class-validator';
import type {
  Content,
  NoteStatus,
  NotePermission,
} from '../interfaces/note.interface';

export class CreateNoteDto {
  @ApiPropertyOptional({
    description: 'Note title (defaults to "Untitled" if not provided)',
    example: 'My First Note',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Rich text content in Quill Delta format',
    example: { ops: [{ insert: 'Hello World\n' }] },
  })
  @IsNotEmpty()
  content!: Content;

  @ApiProperty({
    description: 'User ID who created the note',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userUID!: string;

  @ApiPropertyOptional({
    description: 'Array of tags',
    example: ['typescript', 'nestjs'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Array of category names to associate',
    example: ['work', 'research'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Mark as favorite',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Note status',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: NoteStatus;

  @ApiPropertyOptional({
    description: 'Permission level',
    enum: ['private', 'shared', 'public'],
    default: 'private',
  })
  @IsOptional()
  @IsEnum(['private', 'shared', 'public'])
  permissions?: NotePermission;
}
