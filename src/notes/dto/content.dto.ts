import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsObject,
  IsNotEmpty,
  ValidateNested,
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ContentAlign,
  ContentList,
  ContentHeader,
} from '../interfaces/note.interface';

/**
 * Custom validator for the Quill Delta `insert` field.
 *
 * Valid shapes:
 *   - `string`             — plain or formatted text
 *   - `{ image: string }`  — image embed (URL or base64), no extra keys
 *   - `{ video: string }`  — video embed (URL), no extra keys
 */
function IsQuillInsert(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isQuillInsert',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'insert must be a string (text), { image: string } (image embed), or { video: string } (video embed)',
        ...options,
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value === 'string') return true;
          if (typeof value === 'object' && value !== null) {
            const obj = value as Record<string, unknown>;
            const keys = Object.keys(obj);
            return (
              (keys.length === 1 && typeof obj['image'] === 'string') ||
              (keys.length === 1 && typeof obj['video'] === 'string')
            );
          }
          return false;
        },
      },
    });
  };
}

/**
 * Formatting and structural attributes for a single Quill Delta operation.
 *
 * All fields are optional — only present when the attribute is explicitly applied.
 * Inline attributes (bold, color, link …) apply to the inserted text.
 * Block attributes (align, list, header, indent) apply to the entire line/block.
 */
export class ContentOperationAttributesDto {
  // ── Inline text formatting ────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Bold text', example: true })
  @IsOptional()
  @IsBoolean()
  bold?: boolean;

  @ApiPropertyOptional({ description: 'Italic text', example: true })
  @IsOptional()
  @IsBoolean()
  italic?: boolean;

  @ApiPropertyOptional({ description: 'Underlined text', example: true })
  @IsOptional()
  @IsBoolean()
  underline?: boolean;

  @ApiPropertyOptional({ description: 'Strikethrough text', example: true })
  @IsOptional()
  @IsBoolean()
  strike?: boolean;

  @ApiPropertyOptional({
    description: 'Text foreground color (any valid CSS color: hex, rgb, named)',
    example: '#e60000',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Text background highlight color (any valid CSS color)',
    example: '#ffff00',
  })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional({
    description: 'Font family name as registered in the Quill font whitelist',
    example: 'serif',
  })
  @IsOptional()
  @IsString()
  font?: string;

  @ApiPropertyOptional({
    description:
      'Font size as registered in the Quill size whitelist (e.g. "small", "large", "huge")',
    example: 'large',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    description: 'Hyperlink URL applied to the text',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsString()
  link?: string;

  // ── Block / paragraph formatting ──────────────────────────────────────────

  @ApiPropertyOptional({
    description:
      'Paragraph text alignment (block-level attribute, applied on the newline op)',
    enum: ContentAlign,
    enumName: 'ContentAlign',
    example: ContentAlign.CENTER,
  })
  @IsOptional()
  @IsEnum(ContentAlign)
  align?: ContentAlign;

  @ApiPropertyOptional({
    description:
      'List type for block-level list formatting (block-level attribute)',
    enum: ContentList,
    enumName: 'ContentList',
    example: ContentList.BULLET,
  })
  @IsOptional()
  @IsEnum(ContentList)
  list?: ContentList;

  @ApiPropertyOptional({
    description:
      'Heading level 1–6, where 1 is the largest (block-level attribute)',
    enum: ContentHeader,
    enumName: 'ContentHeader',
    example: ContentHeader.H1,
  })
  @IsOptional()
  @IsEnum(ContentHeader)
  header?: ContentHeader;

  @ApiPropertyOptional({
    description:
      'Indentation depth — number of levels to indent the block (1 = one tab stop)',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  indent?: number;
}

/**
 * A single Quill Delta operation.
 *
 * Every Delta is composed of sequential operations; an insert-only Delta
 * (the format used here) describes the complete document state.
 *
 * The `insert` field has three possible shapes:
 *   - `string`             — plain or formatted text; every paragraph ends with `"\n"`
 *   - `{ image: string }`  — image embed; value is a URL or base64 data URI
 *   - `{ video: string }`  — video embed; value is a URL (e.g. YouTube embed link)
 *
 * The optional `attributes` object describes how the content is formatted.
 * Inline attributes apply to text; block attributes apply to the line (`"\n"` insert).
 */
export class ContentOperationDto {
  @ApiProperty({
    description:
      'Content to insert. Three valid shapes:\n' +
      '  • string            — plain or formatted text (paragraphs end with "\\n")\n' +
      '  • { image: string } — image embed (URL or base64 data URI)\n' +
      '  • { video: string } — video embed URL',
    examples: {
      text: { summary: 'Plain text', value: 'Hello World\n' },
      boldText: {
        summary: 'Formatted text (attributes carry the style)',
        value: 'World',
      },
      image: {
        summary: 'Image embed',
        value: { image: 'https://example.com/photo.png' },
      },
      video: {
        summary: 'Video embed',
        value: { video: 'https://youtube.com/embed/dQw4w9WgXcQ' },
      },
    },
  })
  @IsNotEmpty()
  @IsQuillInsert()
  insert!: string | { image: string } | { video: string };

  @ApiPropertyOptional({
    description: 'Formatting attributes applied to this operation',
    type: () => ContentOperationAttributesDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContentOperationAttributesDto)
  attributes?: ContentOperationAttributesDto;
}

/**
 * Quill Delta content — the canonical rich-text format produced by the Quill editor.
 *
 * A Delta document is represented as a flat array of insert operations (`ops`).
 * Reading them sequentially reconstructs the full document, including formatting.
 *
 * Example — "Hello **World**\n":
 * ```json
 * {
 *   "ops": [
 *     { "insert": "Hello " },
 *     { "insert": "World", "attributes": { "bold": true } },
 *     { "insert": "\n" }
 *   ]
 * }
 * ```
 */
export class ContentDto {
  @ApiProperty({
    description:
      'Ordered array of Quill Delta insert operations that compose the document',
    type: () => [ContentOperationDto],
    example: {
      ops: [
        { insert: 'Hello ' },
        { insert: 'World', attributes: { bold: true } },
        { insert: '\n' },
      ],
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentOperationDto)
  ops!: ContentOperationDto[];
}
