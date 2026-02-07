import { buildNameWithDateTime } from '../utils.js';

export default function saveBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename || buildNameWithDateTime('downloaded');
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(objectUrl);
}