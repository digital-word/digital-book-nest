import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';

import { NoteDetail, NoteItem } from './interfaces/note.interface';
import { CreateNoteDto } from './dto/create-note.dto';
import { SingleResponse, ListResponse, ListQueryDto } from '../common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * GET /notes - Get all notes (paginated)
   * Query params: page, limit, includeDeleted (optional)
   */
  @Get()
  @ApiOperation({
    summary: 'Get a single page of notes',
    description: 'Retrieve all notes with pagination',
  })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async findPage(
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<NoteItem>> {
    const { data, total } = await this.notesService.findPage(query);

    return new ListResponse(
      data,
      query.page,
      query.limit,
      total,
      'Notes retrieved successfully',
    );
  }

  /**
   * GET /notes/favorites - Get favorite notes (paginated)
   */
  @Get('favorites')
  @ApiOperation({
    summary: 'Get favorite notes',
    description: 'Retrieve all favorite notes with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite notes retrieved successfully',
  })
  findFavorites(): Promise<ListResponse<NoteItem>> {
    // TODO
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * GET /notes/search - Search notes (paginated)
   * Query params: q (required), page, limit
   */
  @Get('search')
  @ApiOperation({
    summary: 'Search notes',
    description: 'Search notes by keyword in title and content',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query string' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  search(): Promise<ListResponse<NoteItem>> {
    // TODO
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * GET /notes/:id - Get a single note
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get note by ID',
    description: 'Retrieve a single note by its ID',
  })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  findOne(): Promise<SingleResponse<NoteDetail>> {
    // TODO
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * POST /notes - Create a new note
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new note',
    description: 'Create a new note with rich text content',
  })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: DecodedIdToken,
  ): Promise<SingleResponse<string>> {
    const message = await this.notesService.noteInsert(dto, user.uid);
    return new SingleResponse(message, 'Note created successfully');
  }

  /**
   * PUT /notes/:id - Update a note
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update a note',
    description: 'Update an existing note',
  })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(): Promise<SingleResponse<any>> {
    // TODO
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * PUT /notes/:id/restore - Restore a soft-deleted note
   */
  @Put(':id/restore')
  @ApiOperation({
    summary: 'Restore a deleted note',
    description: 'Restore a soft-deleted note',
  })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note restored successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  restore(): Promise<SingleResponse<any>> {
    // TODO
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * DELETE /notes/:id - Soft delete a note
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a note',
    description: 'Soft delete a note (can be restored)',
  })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(): Promise<void> {
    // TODO
    return Promise.resolve();
  }

  /**
   * DELETE /notes/:id/permanent - Permanently delete a note
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Permanently delete a note',
    description: 'Permanently delete a note (cannot be restored)',
  })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note permanently deleted' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  permanentlyDelete(): Promise<void> {
    // TODO
    return Promise.resolve();
  }
}
