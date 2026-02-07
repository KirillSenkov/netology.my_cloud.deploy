import { api } from './http';
import type {
  DownloadMode,
  RenameFileResponse,
  CommentFileResponse,
  ShareResponse,
} from './types';
import type { FileDTO, } from '../features/types';


/** Builds a download URL for a file.
 * @param fileId Requested file ID
 * @param mode Download mode, either 'download' or 'preview'. Default is 'download'.
 * @returns Download URL string.
 * Response of the Django-server is FileResponse(... as_attachment = False ...) 
 * if mode is 'preview' (inline). Else, it is served as attachment.
 */
export function buildDownloadUrl(fileId: number, mode: DownloadMode = 'download'): string {
  const base = `/files/${fileId}/download/`;
  if (mode === 'preview') return `/api${base}?mode=preview`;
  return base;
}

export async function getFiles(userId?: number): Promise<FileDTO[]> {
  const { data } = await api.get<FileDTO[]>('/files/', {
    params: userId ? { user_id: userId } : undefined,
  });

  return data;
}

export async function postFile(file: File, comment: string | null): Promise<FileDTO> {
  const form = new FormData();
  form.append('file', file);

  if (comment !== null) {
    form.append('comment', comment);
  }

  const res = await api.post<FileDTO>('/files/upload/', form);
  return res.data;
}

// Downloads a file as a Blob.
export async function downloadFile(fileId: number): Promise<Blob> {
  const res = await api.get(buildDownloadUrl(fileId), {
    responseType: 'blob',
  });

  return res.data as Blob;
}

export async function deleteFile(fileId: number): Promise<{ detail: string }> {
  const { data } = await api.delete<{ detail: string }>(`/files/${fileId}/`);
  return data;
}

export async function patchRenameFile(fileId: number, name: string): Promise<RenameFileResponse> {
  const { data } = await api.patch<RenameFileResponse>(`/files/${fileId}/rename/`, { name });
  return data;
}

export async function patchCommentFile(fileId: number, comment: string | null): Promise<CommentFileResponse> {
  const { data } = await api.patch<CommentFileResponse>(`/files/${fileId}/comment/`, { comment });
  return data;
}

export async function enableShare(fileId: number): Promise<ShareResponse> {
  const { data } = await api.post<ShareResponse>(`/files/${fileId}/share/`);
  return data;
}

export async function disableShare(fileId: number): Promise<ShareResponse> {
  const { data } = await api.post<ShareResponse>(`/files/${fileId}/share/disable/`);
  return data;
}
