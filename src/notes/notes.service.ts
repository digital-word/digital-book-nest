import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { Note, Content } from './interfaces/note.interface';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

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
    const notes = await this.readNotes();

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
    const allNotes = await this.getAllNotes(includeDeleted);
    const total = allNotes.length;

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Slice the array for pagination
    const data = allNotes.slice(startIndex, endIndex);

    return { data, total };
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
   * Create a new note
   */
  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const notes = await this.readNotes();

    const newNote: Note = {
      id: uuidv4(),
      title: createNoteDto.title,
      content: createNoteDto.content,
      createdBy: createNoteDto.createdBy,
      createdTime: new Date(),
      updatedTime: new Date(),
      tags: createNoteDto.tags || [],
      category: createNoteDto.category,
      isFavorite: createNoteDto.isFavorite || false,
      status: createNoteDto.status || 'draft',
      permissions: createNoteDto.permissions || 'private',
      version: 1,
      searchableText: this.extractSearchableText(createNoteDto.content),
    };

    notes.push(newNote);
    await this.writeNotes(notes);

    return newNote;
  }

  /**
   * Update an existing note
   */
  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const notes = await this.readNotes();
    const noteIndex = notes.findIndex(
      (note) => note.id === id && !note.isDeleted,
    );

    if (noteIndex === -1) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    const updatedNote: Note = {
      ...notes[noteIndex],
      ...updateNoteDto,
      updatedTime: new Date(),
      version: (notes[noteIndex].version || 1) + 1,
    };

    // Update searchable text if content was updated
    if (updateNoteDto.content) {
      updatedNote.searchableText = this.extractSearchableText(
        updateNoteDto.content,
      );
    }

    // Handle soft delete
    if (updateNoteDto.isDeleted && !notes[noteIndex].isDeleted) {
      updatedNote.deletedTime = new Date();
    }

    notes[noteIndex] = updatedNote;
    await this.writeNotes(notes);

    return updatedNote;
  }

  /**
   * Soft delete a note
   */
  async remove(id: string): Promise<void> {
    await this.update(id, { isDeleted: true });
  }

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
  async restore(id: string): Promise<Note> {
    const notes = await this.readNotes();
    const note = notes.find((note) => note.id === id && note.isDeleted);

    if (!note) {
      throw new NotFoundException(`Deleted note with ID ${id} not found`);
    }

    return this.update(id, {
      isDeleted: false,
      deletedTime: undefined,
    });
  }

  /**
   * Get notes by tag (paginated)
   */
  async findByTag(
    tag: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Note[]; total: number }> {
    const notes = await this.getAllNotes();
    const allNotes = notes.filter((note) => note.tags?.includes(tag));
    const total = allNotes.length;
    const startIndex = (page - 1) * limit;
    const data = allNotes.slice(startIndex, startIndex + limit);
    return { data, total };
  }

  /**
   * Get notes by category (paginated)
   */
  async findByCategory(
    category: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Note[]; total: number }> {
    const notes = await this.getAllNotes();
    const allNotes = notes.filter((note) => note.category === category);
    const total = allNotes.length;
    const startIndex = (page - 1) * limit;
    const data = allNotes.slice(startIndex, startIndex + limit);
    return { data, total };
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
        note.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );

    const total = allNotes.length;
    const startIndex = (page - 1) * limit;
    const data = allNotes.slice(startIndex, startIndex + limit);
    return { data, total };
  }
}
