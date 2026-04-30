export type NoteStatus = 'draft' | 'published' | 'archived';
export type NotePermission = 'private' | 'shared' | 'public';

export interface ContentOperation {
  insert: string | { image: string } | { video: string };
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    background?: string;
    font?: string;
    size?: string;
    link?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    list?: 'ordered' | 'bullet';
    header?: 1 | 2 | 3 | 4 | 5 | 6;
    indent?: number;
  };
}

export interface Content {
  ops: ContentOperation[];
}

export interface Note {
  // Core identity
  id: string;

  // Content
  title: string;
  content: Content;

  // Metadata
  createdBy: string;
  createdTime: Date;
  updatedTime: Date;

  // Organization
  tags?: string[];
  category?: string;
  isFavorite?: boolean;

  // Status
  status: NoteStatus;
  isDeleted?: boolean;
  deletedTime?: Date;

  // Collaboration (for future)
  sharedWith?: string[];
  permissions?: NotePermission;

  // Version control (optional, for future)
  version?: number;

  // Search optimization
  searchableText?: string;
}
