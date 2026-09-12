import {
  ListNotesData,
  NoteStatus as DataConnectNoteStatus,
  NotePermission as DataConnectNotePermission,
} from '@dataconnect/admin-generated';
import {
  NoteItem,
  NoteStatus,
  NotePermission,
} from './interfaces/note.interface';

type DataConnectNoteListItem = ListNotesData['notes'][number];

/**
 * Generated and domain enums share the same string values but are distinct
 * nominal types, so a plain `as` cast is rejected by the compiler. Validating
 * against `keyof typeof` (instead of `as unknown as`) fails loudly if the two
 * enums ever drift apart.
 */
export function toDomainNoteStatus(status: DataConnectNoteStatus): NoteStatus {
  return NoteStatus[status.toUpperCase() as keyof typeof NoteStatus];
}

export function toDomainNotePermission(
  permission: DataConnectNotePermission,
): NotePermission {
  return NotePermission[
    permission.toUpperCase() as keyof typeof NotePermission
  ];
}

export function toDomainNoteItem(dc: DataConnectNoteListItem): NoteItem {
  return {
    id: dc.id,
    title: dc.title,
    isFavorite: dc.isFavorite,
    status: toDomainNoteStatus(dc.status),
    permissions: toDomainNotePermission(dc.permissions),
    createdAt: new Date(dc.createdAt),
    updatedAt: dc.updatedAt ? new Date(dc.updatedAt) : undefined,
    tags: dc.tags,
    categories: dc.categories,
  };
}

export function toDataConnectNoteStatus(
  status: NoteStatus,
): DataConnectNoteStatus {
  // domain enum values already match DataConnect's (lowercase) keys, e.g. 'draft' -> draft
  return DataConnectNoteStatus[status as keyof typeof DataConnectNoteStatus];
}

export function toDataConnectNotePermission(
  permission: NotePermission,
): DataConnectNotePermission {
  return DataConnectNotePermission[
    permission as keyof typeof DataConnectNotePermission
  ];
}
