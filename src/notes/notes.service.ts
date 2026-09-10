import { Injectable, Logger } from '@nestjs/common';
import { Note, Content } from './interfaces/note.interface';
import {
  listNotes,
  countNotes,
  createNote,
  NoteStatus as DataConnectNoteStatus,
  NotePermission as DataConnectNotePermission,
} from '@dataconnect/admin-generated';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);
  /**
   * Extract plain text from content for search optimization
   */
  private extractSearchableText(content: Content): string {
    if (!content?.ops) {
      return '';
    }

    return content.ops
      .map((op) => {
        if (typeof op.insert === 'string') {
          return op.insert;
        }
        return '';
      })
      .join(' ')
      .trim();
  }

  /**
   * Get all notes (private helper for internal use)
   */
  private async getAllNotes(includeDeleted = false): Promise<Note[]> {
    const result = await listNotes({ limit: 1000, offset: 0 });
    const notes = result.data.notes as unknown as Note[];

    if (includeDeleted) {
      return notes;
    }

    return notes.filter((note) => !note.isDeleted);
  }

  /**
   * Get a single page of notes using server-side pagination.
   *
   * Delegates offset/limit directly to Firebase DataConnect, so only the
   * requested page is transferred — no in-memory slicing needed.
   *
   * @param page  1-based page number requested by the caller
   * @param limit Maximum number of notes per page
   */
  async findPage(
    query: ListQueryDto,
  ): Promise<{ data: Note[]; total: number }> {
    this.logger.debug(`findPage called: ${JSON.stringify(query)}`);
    const offset = (query.page - 1) * query.limit;
    try {
      const [pageResult, countResult] = await Promise.all([
        listNotes({ limit: query.limit, offset, order: query.sortOrder }),
        countNotes(),
      ]);
      const data = pageResult.data.notes as unknown as Note[];
      const total = countResult.data.notes[0]._count;

      this.logger.log(`findPage result: total=${total}`);
      return { data, total };
    } catch (error) {
      this.logger.error('findPage failed', error);
      throw error;
    }
  }

  /**
   * Create a new note.
   *
   * @param dto     Validated note payload from the request body
   * @param userUID Authenticated user's UID (owner of the note)
   */
  async noteInsert(dto: CreateNoteDto, userUID: string): Promise<string> {
    this.logger.debug(`noteInsert called: ${JSON.stringify(dto)}`);
    try {
      const result = await createNote({
        title: dto.title,
        content: dto.content,
        userUID,
        isFavorite: dto.isFavorite,
        status: dto.status as unknown as DataConnectNoteStatus,
        permissions: dto.permissions as unknown as DataConnectNotePermission,
      });

      const id = result.data.note_insert.id;
      this.logger.log(`noteInsert result: id=${id}`);
      return `Note "${dto.title}" was created successfully`;
    } catch (error) {
      this.logger.error('noteInsert failed', error);
      throw error;
    }
  }

  /**
   * Get a single note by ID
   */
  async findOne() {
    // TODO
  }

  /**
   * Generate a unique default title
   */
  private async generateDefaultTitle() {
    // TODO
  }

  /**
   * Update an existing note
   */
  async update() {
    // TODO
  }

  /**
   * Soft delete a note
   */
  async remove() {
    // TODO
  }

  /**
   * Permanently delete a note
   */
  async permanentlyDelete() {
    // TODO
  }

  /**
   * Restore a soft-deleted note
   */
  async restore() {
    // TODO
  }

  /**
   * Get favorite notes (paginated)
   */
  async findFavorites(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Note[]; total: number }> {
    const notes = await this.getAllNotes();
    const allNotes = notes.filter((note) => note.isFavorite === true);
    const total = allNotes.length;
    const startIndex = (page - 1) * limit;
    const data = allNotes.slice(startIndex, startIndex + limit);
    return { data, total };
  }

  /**
   * Search notes by text (paginated)
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Note[]; total: number }> {
    const notes = await this.getAllNotes();
    const lowercaseQuery = query.toLowerCase();

    const allNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.searchableText?.toLowerCase().includes(lowercaseQuery) ||
        note.tags?.some((tag) =>
          tag.name.toLowerCase().includes(lowercaseQuery),
        ),
    );

    const total = allNotes.length;
    const startIndex = (page - 1) * limit;
    const data = allNotes.slice(startIndex, startIndex + limit);
    return { data, total };
  }
}
