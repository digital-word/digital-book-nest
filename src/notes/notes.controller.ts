import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './interfaces/note.interface';
import {
  SingleResponse,
  ListResponse,
  ListQueryDto,
} from '../common';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * GET /notes - Get all notes (paginated)
   * Query params: page, limit, includeDeleted (optional)
   */
  @Get()
  @ApiOperation({ summary: 'Get all notes', description: 'Retrieve all notes with pagination' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async findAll(@Query() query: ListQueryDto): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findAll(
      query.page,
      query.limit,
      query.includeDeleted,
    );

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
  @ApiOperation({ summary: 'Get favorite notes', description: 'Retrieve all favorite notes with pagination' })
  @ApiResponse({ status: 200, description: 'Favorite notes retrieved successfully' })
  async findFavorites(
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findFavorites(
      query.page,
      query.limit,
    );

    return new ListResponse(
      data,
      query.page,
      query.limit,
      total,
      'Favorite notes retrieved successfully',
    );
  }

  /**
   * GET /notes/search - Search notes (paginated)
   * Query params: q (required), page, limit
   */
  @Get('search')
  @ApiOperation({ summary: 'Search notes', description: 'Search notes by keyword in title and content' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query string' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(
    @Query('q') q: string,
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.search(
      q,
      query.page,
      query.limit,
    );

    return new ListResponse(
      data,
      query.page,
      query.limit,
      total,
      'Search results retrieved successfully',
    );
  }

  /**
   * GET /notes/tag/:tag - Get notes by tag (paginated)
   */
  @Get('tag/:tag')
  @ApiOperation({ summary: 'Get notes by tag', description: 'Retrieve all notes with a specific tag' })
  @ApiParam({ name: 'tag', description: 'Tag name to filter by' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async findByTag(
    @Param('tag') tag: string,
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findByTag(
      tag,
      query.page,
      query.limit,
    );

    return new ListResponse(
      data,
      query.page,
      query.limit,
      total,
      `Notes with tag '${tag}' retrieved successfully`,
    );
  }

  /**
   * GET /notes/category/:category - Get notes by category (paginated)
   */
  @Get('category/:category')
  @ApiOperation({ summary: 'Get notes by category', description: 'Retrieve all notes in a specific category' })
  @ApiParam({ name: 'category', description: 'Category name to filter by' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async findByCategory(
    @Param('category') category: string,
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findByCategory(
      category,
      query.page,
      query.limit,
    );

    return new ListResponse(
      data,
      query.page,
      query.limit,
      total,
      `Notes in category '${category}' retrieved successfully`,
    );
  }

  /**
   * GET /notes/:id - Get a single note
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID', description: 'Retrieve a single note by its ID' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(@Param('id') id: string): Promise<SingleResponse<Note>> {
    const note = await this.notesService.findOne(id);
    return new SingleResponse(note, 'Note retrieved successfully');
  }

  /**
   * POST /notes - Create a new note
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new note', description: 'Create a new note with rich text content' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<SingleResponse<Note>> {
    const note = await this.notesService.create(createNoteDto);
    return new SingleResponse(note, 'Note created successfully');
  }

  /**
   * PUT /notes/:id - Update a note
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a note', description: 'Update an existing note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<SingleResponse<Note>> {
    const note = await this.notesService.update(id, updateNoteDto);
    return new SingleResponse(note, 'Note updated successfully');
  }

  /**
   * PUT /notes/:id/restore - Restore a soft-deleted note
   */
  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore a deleted note', description: 'Restore a soft-deleted note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note restored successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async restore(@Param('id') id: string): Promise<SingleResponse<Note>> {
    const note = await this.notesService.restore(id);
    return new SingleResponse(note, 'Note restored successfully');
  }

  /**
   * DELETE /notes/:id - Soft delete a note
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note', description: 'Soft delete a note (can be restored)' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.notesService.remove(id);
  }

  /**
   * DELETE /notes/:id/permanent - Permanently delete a note
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a note', description: 'Permanently delete a note (cannot be restored)' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note permanently deleted' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async permanentlyDelete(@Param('id') id: string): Promise<void> {
    return this.notesService.permanentlyDelete(id);
  }
}
