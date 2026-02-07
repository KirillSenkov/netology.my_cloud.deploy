import './FilesEditModal.css';

type FilesEditModalProps = {
  isOpen: boolean;

  name: string;
  comment: string;

  isBusy: boolean;
  errors: string[];

  onClose: () => void;
  onNameChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
};

export default function FilesEditModal({
  isOpen,
  name,
  comment,
  isBusy,
  errors,
  onClose,
  onNameChange,
  onCommentChange,
  onSubmit,
}: FilesEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className='filesEditModal' role='dialog' aria-modal='true'>
      <button
        className='filesEditModal__backdrop'
        type='button'
        aria-label='Закрыть'
        onClick={onClose}
        disabled={isBusy}
      />

      <div className='filesEditModal__panel'>
        <div className='filesEditModal__title'>Редактирование файла</div>

        <label className='filesEditModal__field'>
          <div className='filesEditModal__label'>Имя файла</div>
          <input
            className='filesEditModal__input'
            type='text'
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={isBusy}
          />
        </label>

        <label className='filesEditModal__field'>
          <div className='filesEditModal__label'>Комментарий</div>
          <textarea
            className='filesEditModal__textarea'
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={4}
            disabled={isBusy}
          />
        </label>

        {errors.length > 0 && (
          <div className='filesEditModal__error'>
            <div className='filesEditModal__errorTitle'>Ошибки:</div>
            <ul className='filesEditModal__errorList'>
              {errors.map((msg, i) => (
                <li key={`${i}-${msg}`}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className='filesEditModal__actions'>
          <button
            className='filesEditModal__btn'
            type='button'
            onClick={onClose}
            disabled={isBusy}
          >
            Отмена
          </button>

          <button
            className='filesEditModal__btn filesEditModal__btn--primary'
            type='button'
            onClick={onSubmit}
            disabled={isBusy}
          >
            {isBusy ? 'Применяем…' : 'Применить'}
          </button>
        </div>
      </div>
    </div>
  );
}
