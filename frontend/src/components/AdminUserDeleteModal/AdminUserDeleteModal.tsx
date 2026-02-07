import { useEffect, useState } from 'react';
import './AdminUserDeleteModal.css';

export type Props = {
  isOpen: boolean;
  username: string;
  isBusy: boolean;
  error: string | null;

  onClose: () => void;
  onConfirm: (deleteFiles: boolean) => void;
};

export default function AdminUserDeleteModal({
  isOpen,
  username,
  isBusy,
  error,
  onClose,
  onConfirm,
}: Props) {
  const [deleteFiles, setDeleteFiles] = useState(true);

  useEffect(() => {
    if (isOpen) setDeleteFiles(true);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='adminUserDeleteModal' role='dialog' aria-modal='true'>
      <button
        className='adminUserDeleteModal__backdrop'
        type='button'
        aria-label='Закрыть'
        onClick={onClose}
        disabled={isBusy}
      />

      <div className='adminUserDeleteModal__panel'>
        <div className='adminUserDeleteModal__title'>Удаление пользователя</div>

        <div className='adminUserDeleteModal__text'>
          Вы уверены, что хотите удалить пользователя
          <span className='adminUserDeleteModal__username'> {username}</span>?
        </div>

        <label className='adminUserDeleteModal__check'>
          <input
            type='checkbox'
            checked={deleteFiles}
            onChange={(e) => setDeleteFiles(e.target.checked)}
            disabled={isBusy}
          />
          <span>Удалить файлы пользователя</span>
        </label>

        <div className='adminUserDeleteModal__warning'>Действие необратимо.</div>

        {error ? <div className='adminUserDeleteModal__error'>{error}</div> : null}

        <div className='adminUserDeleteModal__actions'>
          <button
            className='adminUserDeleteModal__btn'
            type='button'
            onClick={onClose}
            disabled={isBusy}
          >
            Отмена
          </button>

          <button
            className='adminUserDeleteModal__btn adminUserDeleteModal__btn--danger'
            type='button'
            onClick={() => onConfirm(deleteFiles)}
            disabled={isBusy}
          >
            {isBusy ? 'Удаление…' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}
