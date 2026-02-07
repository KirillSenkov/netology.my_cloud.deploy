import './FilesUploadModal.css';
import type { Status } from '../../features/types';

type FilesUploadModalProps = {
  isOpen: boolean;
  file: File | null;
  comment: string;
  status: Status;
  error: string | null;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
};

export default function FilesUploadModal({
  isOpen,
  file,
  comment,
  status,
  error,
  onClose,
  onFileChange,
  onCommentChange,
  onSubmit,
}: FilesUploadModalProps) {
  if (!isOpen) return null;

  const isBusy = status === 'loading';

  return (
    <div className='filesUploadModal' role='dialog' aria-modal='true'>
      <button
        className='filesUploadModal__backdrop'
        type='button'
        aria-label='Закрыть'
        onClick={onClose}
      />

      <div className='filesUploadModal__panel'>
        <div className='filesUploadModal__title'>Загрузка файла</div>

        <label className='filesUploadModal__field'>
          <div className='filesUploadModal__label'>Файл</div>
          <input
            className='filesUploadModal__input'
            type='file'
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        <label className='filesUploadModal__field'>
          <div className='filesUploadModal__label'>Комментарий</div>
          <textarea
            className='filesUploadModal__textarea'
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={4}
          />
        </label>

        {status === 'failed' && error && (
          <div className='filesUploadModal__error'>{error}</div>
        )}

        <div className='filesUploadModal__actions'>
          <button
            className='filesUploadModal__btn'
            type='button'
            onClick={onClose}
            disabled={isBusy}
          >
            Отмена
          </button>

          <button
            className='filesUploadModal__btn filesUploadModal__btn--primary'
            type='button'
            onClick={onSubmit}
            disabled={isBusy || !file}
          >
            {isBusy ? 'Загрузка...' : 'Загрузить'}
          </button>
        </div>
      </div>
    </div>
  );
}
