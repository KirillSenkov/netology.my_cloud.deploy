export type UserLevel = 'user' | 'admin' | 'senior_admin' | 'superuser'
export type UserRank = 3 | 2 | 1 | 0;

export type DownloadMode = 'download' | 'preview';

export type LoginRequest = {
  username: string,
  password: string,
};

export type LoginResponse = {
  detail: string,
  user: UserPublic,
};

export type MeResponse = {
  user: UserPublic,
};

export type RegisterRequest = {
  username: string,
  full_name: string,
  email: string,
  password: string,
};

export type RegisterResponse = Pick<
  UserPublic,
  'id' | 'username' | 'full_name' | 'email' | 'is_admin' | 'storage_rel_path'
>

export interface UserPublic {
  id: number
  username: string
  full_name: string
  email: string
  is_admin: boolean
  is_staff: boolean
  is_superuser: boolean
  level: UserLevel
  rank: number
  storage_rel_path: string
}

export interface FileItem {
  id: number
  original_name: string
  size_bytes: number
  comment: string | null
  uploaded: string // ISO datetime
  last_downloaded?: string | null
  share_enabled?: boolean
  share_token?: string | null
  share_url?: string | null
}

export interface ApiError {
  detail: string
  errors?: Record<string, string[]>
}

export type RenameFileResponse = {
  id: number;
  original_name: string;
};

export type CommentFileResponse = {
  id: number;
  comment: string | null;
};

export type ShareResponse = {
  id: number;
  share_url: string | null;
  share_created: string | null;
  share_token: string | null;
};

export type AdminUserDTO = {
  id: number;
  username: string;
  fullName: string;
  email: string;

  isAdmin: boolean;
  isStaff: boolean;
  isSuperuser: boolean;

  level: UserLevel;
  rank: UserRank;

  storageRelPath: string;

  filesCount: number;
  totalStorageBytes: number;
};

export type AdminUserApiDTO = {
  id: number;
  username: string;
  full_name: string;
  email: string;

  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;

  level: UserLevel;
  rank: number;

  storage_rel_path: string;

  files_count: number;
  total_storage_bytes: number;
};

export type SetUserLevelResponse = {
  detail: string;
  user: {
    id: number;
    username: string;
    level: UserLevel;
    rank: UserRank;
    isAdmin: boolean;
    isStaff: boolean;
    isSuperuser: boolean;
  };
};

export type SetUserLevelApiResponse = {
  detail: string;
  user: {
    id: number;
    username: string;
    level: UserLevel;
    rank: UserRank;
    is_admin: boolean;
    is_staff: boolean;
    is_superuser: boolean;
  };
};

