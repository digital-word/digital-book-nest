import {
  Content,
  NoteStatus,
  NotePermission,
} from '../interfaces/note.interface';

export class UpdateNoteDto {
  title?: string;
  content?: Content;
  tags?: string[];
  category?: string;
  isFavorite?: boolean;
  status?: NoteStatus;
  permissions?: NotePermission;
  isDeleted?: boolean;
  deletedTime?: Date;
  sharedWith?: string[];
}
