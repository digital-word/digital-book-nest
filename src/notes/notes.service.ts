import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { Note, Content } from './interfaces/note.interface';
import { listNotes } from '@dataconnect/admin-generated';

@Injectable()
export class NotesService {
  private readonly dataPath = join(process.cwd(), 'data', 'notes.json');

  /**
   * Read all notes from JSON file
   */
  private async readNotes(): Promise<Note[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data) as Note[];
    } catch {
      // If file doesn't exist or is empty, return empty array
      return [];
    }
  }

  /**
   * Write notes to JSON file
   */
  private async writeNotes(notes: Note[]): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(notes, null, 2), 'utf-8');
  }

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
   * Get all notes (paginated)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    includeDeleted = false,
  ): Promise<{ data: Note[]; total: number }> {
    const offset = (page - 1) * limit;

    if (includeDeleted) {
      // includeDeleted needs getAllNotes since ListNotes filters isDeleted=false
      const allNotes = await this.getAllNotes(true);
      const total = allNotes.length;
      const data = allNotes.slice(offset, offset + limit);
      return { data, total };
    }

    const result = await listNotes({ limit, offset });
    const data = result.data.notes as unknown as Note[];

    // total is unknown without a count query — return data.length as floor
    return { data, total: data.length + offset };
  }

  /**
   * Get a single note by ID
   */
  async findOne(id: string): Promise<Note> {
    const notes = await this.readNotes();
    const note = notes.find((note) => note.id === id && !note.isDeleted);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  /**
   * Generate a unique default title
   */
  private async generateDefaultTitle(): Promise<string> {
    const notes = await this.readNotes();

    const untitledPattern = /^Untitled( \d+)?$/;
    const untitledNumberPattern = /^Untitled (\d+)$/;

    // Find all "Untitled" notes
    const untitledNotes = notes.filter((note) =>
      untitledPattern.exec(note.title),
    );

    if (untitledNotes.length === 0) {
      return 'Untitled';
    }

    // Find the highest number
    const numbers = untitledNotes
      .map((note) => {
        const match = untitledNumberPattern.exec(note.title);
        return match ? Number.parseInt(match[1], 10) : 0;
      })
      .filter((num) => !Number.isNaN(num));

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `Untitled ${maxNumber + 1}`;
  }

  /**
   * Update an existing note
   */
  async update() {}

  /**
   * Soft delete a note
   */
  async remove() {}

  /**
   * Permanently delete a note
   */
  async permanentlyDelete(id: string): Promise<void> {
    const notes = await this.readNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);

    if (notes.length === filteredNotes.length) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    await this.writeNotes(filteredNotes);
  }

  /**
   * Restore a soft-deleted note
   */
  async restore() {}

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
