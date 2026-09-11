import { Injectable, Logger } from '@nestjs/common';
import { NoteItem, Content } from './interfaces/note.interface';
import {
  listNotes,
  countNotes,
  createNote,
} from '@dataconnect/admin-generated';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import {
  toDataConnectNoteStatus,
  toDataConnectNotePermission,
  toDomainNoteItem,
} from './notes.mapper';

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
  ): Promise<{ data: NoteItem[]; total: number }> {
    this.logger.debug(`findPage called: ${JSON.stringify(query)}`);
    const offset = (query.page - 1) * query.limit;
    try {
      const [pageResult, countResult] = await Promise.all([
        listNotes({ limit: query.limit, offset, order: query.sortOrder }),
        countNotes(),
      ]);
      const data = pageResult.data.notes.map((note) => toDomainNoteItem(note));
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
        status: toDataConnectNoteStatus(dto.status),
        permissions: toDataConnectNotePermission(dto.permissions),
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
  async findFavorites() {
    // TODO
  }

  /**
   * Search notes by text (paginated)
   */
  async search() {
    // TODO
  }
}
