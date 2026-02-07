import type { AdminUserDTO, UserRank, UserLevel } from '../api/types';

export const ALL_LEVELS: UserLevel[] = ['user', 'admin', 'senior_admin', 'superuser'];
export const ALL_RANKS: UserRank[] = [3, 2, 1, 0];

export const LEVEL_TO_RANK = Object.fromEntries(
  ALL_LEVELS.map((lvl, idx) => [lvl, ALL_RANKS[idx]])
) as Record<UserLevel, UserRank>;

export const RANK_TO_LEVEL = Object.fromEntries(
  ALL_RANKS.map((lvl, idx) => [lvl, ALL_LEVELS[idx]])
) as Record<UserRank, UserLevel>;

export function buildNameWithDateTime(name: string = 'name'): string {
  const d = new Date();

  const pad = (n: number) => String(n).padStart(2, '0');

  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  return `${name}}_${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

/** Convert bytes to human-readable format
 * @param bytes: number - bites count
 * @returns string of formatted bytes
 * @example
 * formatBytes(1024) // returns '1 KB'
*/
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = 0;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }

  const rounded = i === 0 ? String(Math.round(value)) : value.toFixed(1);
  return `${rounded} ${units[i]}`;
}

/** Convert ISO date string to localized date string
 * @param iso: string | null - ISO date string or null
 * @returns string - formatted date or '—'
 * @example 
 * formatDate('2023-01-01T00:00:00Z') // returns localized date string
*/
export function formatDate(iso: string | null): string {
  if (!iso) return '—';

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';

  return d.toLocaleString();
}

export function normalizeNullableText(value: string | null | undefined)
  : string | null {
  const v = (value ?? '').trim();
  return v === '' ? null : v;
}

export function normalizeCommentForApi(text: string): string | null {
  const v = (text ?? '').trim();
  return v === '' ? null : v;
}

export function errorToMessage(e: unknown, fallback: string): string {
  if (typeof e === 'object' && e !== null && 'detail' in e) {
    const detail = (e as Record<string, unknown>).detail;
    if (typeof detail === 'string' && detail.trim() !== '') return detail;
  }
  return fallback;
}

export function humanizeLevel(level: AdminUserDTO['level']): string {
  switch (level) {
    case 'user':
      return 'User';
    case 'admin':
      return 'Admin';
    case 'senior_admin':
      return 'Senior admin';
    case 'superuser':
      return 'Superuser';
    default:
      return String(level);
  }
}