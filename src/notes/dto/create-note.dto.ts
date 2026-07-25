import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NoteStatus, NotePermission } from '../interfaces/note.interface';
import { ContentDto } from './content.dto';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Note title (defaults to "Untitled" if not provided)',
    example: 'My First Note',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Rich text content in Quill Delta format',
    type: () => ContentDto,
    example: { ops: [{ insert: 'Hello World\n' }] },
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

  @ApiPropertyOptional({
    description: 'Array of category names to associate',
    example: ['work', 'research'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({
    description: 'Mark as favorite',
    example: false,
    default: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isFavorite!: boolean;

  @ApiProperty({
    description: 'Note status',
    enum: NoteStatus,
    enumName: 'NoteStatus',
    default: NoteStatus.DRAFT,
  })
  @IsNotEmpty()
  @IsEnum(NoteStatus)
  status!: NoteStatus;

  @ApiProperty({
    description: 'Permission level',
    enum: NotePermission,
    enumName: 'NotePermission',
    default: NotePermission.PRIVATE,
  })
  @IsNotEmpty()
  @IsEnum(NotePermission)
  permissions!: NotePermission;
}
