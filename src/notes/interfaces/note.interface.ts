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

export interface Tag {
  id?: string;
  name: string;
}

export interface Category {
  id?: string;
  name: string;
}

export interface NoteRevision {
  id?: string;
  noteId: string;
  version: number;
  title: string;
  content?: Content;
  searchableText?: string;
  savedAt: Date;
}

export interface Note {
  id?: string;

  // Content
  title: string;
  content?: Content;
  searchableText?: string;

  // Metadata
  userUID: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  // Organization
  tags?: Tag[];
  categories?: Category[];
  isFavorite: boolean;

  // Status
  status: NoteStatus;
  isDeleted: boolean;

  // Collaboration
  permissions: NotePermission;

  // Version control
  version?: number;
}
