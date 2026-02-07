import './FilesDeleteModal.css';

type FilesDeleteModalProps = {
  isOpen: boolean;
  fileName: string;
  isBusy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function FilesDeleteModal({
  isOpen,
  fileName,
  isBusy,
  error,
  onClose,
  onConfirm,
}: FilesDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className='filesDeleteModal' role='dialog' aria-modal='true'>
      <button
        className='filesDeleteModal__backdrop'
        type='button'
        aria-label='Закрыть'
        onClick={onClose}
        disabled={isBusy}
      />

      <div className='filesDeleteModal__panel'>
        <div className='filesDeleteModal__title'>Удаление файла</div>

        <div className='filesDeleteModal__text'>
          Вы уверены, что хотите удалить файл
          <span className='filesDeleteModal__fileName'> {fileName}</span>?
        </div>

        <div className='filesDeleteModal__warning'>
          Действие необратимо.
        </div>

        {error && (
          <div className='filesDeleteModal__error'>{error}</div>
        )}

        <div className='filesDeleteModal__actions'>
          <button
            className='filesDeleteModal__btn'
            type='button'
            onClick={onClose}
            disabled={isBusy}
          >
            Отмена
          </button>

          <button
            className='filesDeleteModal__btn filesDeleteModal__btn--danger'
            type='button'
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}
