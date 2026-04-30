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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './interfaces/note.interface';
import {
  SingleResponse,
  ListResponse,
  createSingleResponse,
  createListResponse,
  ListQueryDto,
} from '../common';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * GET /notes - Get all notes (paginated)
   * Query params: page, limit, includeDeleted (optional)
   */
  @Get()
  async findAll(@Query() query: ListQueryDto): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findAll(
      query.page,
      query.limit,
      query.includeDeleted,
    );

    return createListResponse(
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
  async findFavorites(
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findFavorites(
      query.page,
      query.limit,
    );

    return createListResponse(
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
  async search(
    @Query('q') q: string,
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.search(
      q,
      query.page,
      query.limit,
    );

    return createListResponse(
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
  async findByTag(
    @Param('tag') tag: string,
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findByTag(
      tag,
      query.page,
      query.limit,
    );

    return createListResponse(
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
  async findByCategory(
    @Param('category') category: string,
    @Query() query: ListQueryDto,
  ): Promise<ListResponse<Note>> {
    const { data, total } = await this.notesService.findByCategory(
      category,
      query.page,
      query.limit,
    );

    return createListResponse(
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
  async findOne(@Param('id') id: string): Promise<SingleResponse<Note>> {
    const note = await this.notesService.findOne(id);
    return createSingleResponse(note, 'Note retrieved successfully');
  }

  /**
   * POST /notes - Create a new note
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<SingleResponse<Note>> {
    const note = await this.notesService.create(createNoteDto);
    return createSingleResponse(note, 'Note created successfully');
  }

  /**
   * PUT /notes/:id - Update a note
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<SingleResponse<Note>> {
    const note = await this.notesService.update(id, updateNoteDto);
    return createSingleResponse(note, 'Note updated successfully');
  }

  /**
   * PUT /notes/:id/restore - Restore a soft-deleted note
   */
  @Put(':id/restore')
  async restore(@Param('id') id: string): Promise<SingleResponse<Note>> {
    const note = await this.notesService.restore(id);
    return createSingleResponse(note, 'Note restored successfully');
  }

  /**
   * DELETE /notes/:id - Soft delete a note
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.notesService.remove(id);
  }

  /**
   * DELETE /notes/:id/permanent - Permanently delete a note
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async permanentlyDelete(@Param('id') id: string): Promise<void> {
    return this.notesService.permanentlyDelete(id);
  }
}
