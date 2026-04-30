import {
  Content,
  NoteStatus,
  NotePermission,
} from '../interfaces/note.interface';

export class CreateNoteDto {
  title!: string;
  content!: Content;
  createdBy!: string;
  tags?: string[];
  category?: string;
  isFavorite?: boolean;
  status?: NoteStatus;
  permissions?: NotePermission;
}
