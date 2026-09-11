export enum NoteStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum NotePermission {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
}

export enum ContentAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export enum ContentList {
  ORDERED = 'ordered',
  BULLET = 'bullet',
}

/** Heading levels 1–6; value is the numeric level used by Quill Delta. */
export enum ContentHeader {
  H1 = 1,
  H2 = 2,
  H3 = 3,
  H4 = 4,
  H5 = 5,
  H6 = 6,
}

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
    align?: ContentAlign;
    list?: ContentList;
    header?: ContentHeader;
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

/**
 * Note shape returned by list-style queries
 */
export interface NoteItem {
  id?: string;
  title: string;

  // Metadata
  createdAt: Date;
  updatedAt?: Date;

  // Organization
  tags?: Tag[];
  categories?: Category[];
  isFavorite: boolean;

  status: NoteStatus;
  permissions: NotePermission;
}

/**
 * Note shape returned by details-style queries
 */
export interface NoteDetail extends NoteItem {
  content?: Content;
  searchableText?: string;

  // Metadata
  userUID: string;
  deletedAt?: Date;
  isDeleted: boolean;

  // Version control
  version?: number;
}
