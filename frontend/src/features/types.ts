import type { UserPublic } from '../api/types';

// common
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export type FieldErrors = Record<string, string[]> | null;

export type RejectedPayload = {
  status: number | null,
  detail: string,
  errors?: FieldErrors,
};

// auth
type AuthStatus = Status;

export type AuthState = {
  user: UserPublic | null,
  status: AuthStatus,
  error: string | null,
  fieldErrors: FieldErrors,
} | null;

// files
export type FilesStatus = Status;

export type FilesState = {
  items: FileDTO[],
  status: FilesStatus,
  error: string | null,

  uploadStatus: Status,
  uploadError: string | null,
};

export type FileDTO = {
  id: number,
  original_name: string,
  size_bytes: number,
  comment: string | null,
  uploaded: string,
  last_downloaded: string | null,
  share_url: string | null,
  share_created: string | null,
};
