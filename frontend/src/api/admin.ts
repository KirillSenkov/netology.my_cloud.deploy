import { api } from './http';
import type {
  AdminUserApiDTO,
  AdminUserDTO,
  SetUserLevelApiResponse,
  SetUserLevelResponse,
  UserLevel,
  UserRank,
} from './types';

const mapAdminUser = (u: AdminUserApiDTO): AdminUserDTO => ({
  id: u.id,
  username: u.username,
  fullName: u.full_name,
  email: u.email,

  isAdmin: u.is_admin,
  isStaff: u.is_staff,
  isSuperuser: u.is_superuser,

  level: u.level,
  rank: u.rank as UserRank,

  storageRelPath: u.storage_rel_path,

  filesCount: u.files_count,
  totalStorageBytes: u.total_storage_bytes,
});

export async function getUsers(): Promise<AdminUserDTO[]> {
  const { data } = await api.get<AdminUserApiDTO[]>('/admin/users/');
  return data.map(mapAdminUser);
}

export async function deleteUser(
  userId: number,
  deleteFiles: boolean
): Promise<{ detail: string; files_deleted: boolean }> {
  const { data } = await api.delete<{ detail: string; files_deleted: boolean }>(
    `/admin/users/${userId}/`,
    { params: deleteFiles ? { delete_files: 1 } : undefined }
  );
  return data;
}

export async function setUserLevel(
  userId: number,
  level: UserLevel
): Promise<SetUserLevelResponse> {
  const { data } = await api.patch<SetUserLevelApiResponse>(
    `/admin/users/${userId}/level/`,
    { level }
  );

  const { detail, user } = data;

  return {
    detail: detail,
    user: {
      id: user.id,
      username: user.username,
      level: user.level,
      rank: user.rank,
      isAdmin: user.is_admin,
      isStaff: user.is_staff,
      isSuperuser: user.is_superuser,
    },
  };
}
