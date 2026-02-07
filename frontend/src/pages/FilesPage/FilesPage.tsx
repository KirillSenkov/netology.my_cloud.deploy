import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import './FilesPage.css';

import type { FileDTO, Status } from '../../features/types';

import {
  normalizeNullableText,
  normalizeCommentForApi,
  formatBytes,
  formatDate,
  errorToMessage,
} from '../../utils/utils';
import saveBlob from '../../utils/DOM/saveBlob';

import { useAppDispatch, useAppSelector } from '../../app/hooks';

import {
  buildDownloadUrl,
  downloadFile,
  patchRenameFile,
  patchCommentFile,
  enableShare,
  disableShare,
} from '../../api/files';

import {
  fetchFiles,
  uploadFile,
  removeFile,
  resetUploadState,
  markDownloaded,
  updateFileMeta
} from '../../features/files/filesSlice';
import {
  selectFilesError,
  selectFilesItems,
  selectFilesStatus
 } from '../../features/files/selectors'; 
import { selectTargetUser } from '../../features/adminUsers/selectors';

import { setTargetUser } from '../../features/adminUsers/adminUsersSlice';

import UserBadge, { type UserInfo } from '../../components/UserBadge/UserBadge';
import FilesUploadModal from '../../components/FilesUploadModal/FilesUploadModal';
import FilesDeleteModal from '../../components/FilesDeleteModal/FilesDeleteModal';
import FilesEditModal from '../../components/FilesEditModal/FilesEditModal';
import FilesShareModal from '../../components/FilesShareModal/FilesShareModal';
import AdminUserModal from '../../components/AdminUserModal/AdminUserModal';
import AdminUserDeleteModal from '../../components/AdminUserDeleteModal/AdminUserDeleteModal'

import useAdminUserModals from '../../features/adminUsers/useAdminUserModals';

type TipState =
    {
      comment: string | null,
    }

export default function FilesPage() {
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();

  const userIdRaw = searchParams.get('userId');
  const userId = userIdRaw ? Number(userIdRaw) : null;
  if (userId) dispatch(setTargetUser(userId));

  const isOwnList = userId === null;

  const targetUser = useAppSelector(selectTargetUser);
  const items = useAppSelector(selectFilesItems);
  const status = useAppSelector(selectFilesStatus);
  const error = useAppSelector(selectFilesError);

  const uploadStatus = useAppSelector((state) => state.files.uploadStatus);
  const uploadError = useAppSelector((state) => state.files.uploadError);

  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadComment, setUploadComment] = useState<string>('');

  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [tip, setTip] = useState<TipState>({ comment: null });

  const hoveredAnchorRef = useRef<HTMLElement | null>(null);
  const commentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (userId === null) {
      dispatch(fetchFiles());
      return;
    }

    if (Number.isFinite(userId)) {
      dispatch(fetchFiles({ userId }));
    }
  }, [dispatch, userId]);

  const openOrDownload = (fileId: number) => {
    const url = buildDownloadUrl(fileId, 'preview');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const tipFallback = useMemo(() => {
    if (status === 'loading') return 'Список загружается...';
    if (status === 'failed') return 'Ошибка загрузки списка';
    return 'Чтобы увидеть подсказку, наведите курсор на элемент списка';
  }, [status]);

  const clearTip = () => {
    hoveredAnchorRef.current = null;
    setTip({ comment: null });
  };

  // Comment tip handle
  const handleMouseOverCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    const rawTarget = e.target;
    if (!(rawTarget instanceof Element)) return;

    if (commentRef.current && commentRef.current.contains(rawTarget)) return;

    const anchor = rawTarget.closest('[data-file-name-anchor]');
    if (!(anchor instanceof HTMLElement)) {
      if (hoveredAnchorRef.current) clearTip();
      return;
    }

    if (hoveredAnchorRef.current === anchor) return;

    hoveredAnchorRef.current = anchor;

    const comment = normalizeNullableText(anchor.dataset.comment ?? null);
    setTip({ comment: comment });
  };

  const handleMouseLeave = () => {
    if (hoveredAnchorRef.current) clearTip();
  };

  const handleFocusCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    const rawTarget = e.target;
    if (!(rawTarget instanceof Element)) return;

    const anchor = rawTarget.closest('[data-file-name-anchor]');
    if (!(anchor instanceof HTMLElement)) return;

    hoveredAnchorRef.current = anchor;

    const comment = normalizeNullableText(anchor.dataset.comment ?? null);
    setTip({ comment: comment });
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    const current = e.currentTarget as HTMLElement;

    if (next && current.contains(next)) return;

    if (hoveredAnchorRef.current) clearTip();
  };

  const forwardCommentClickToAnchor = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const anchor = hoveredAnchorRef.current;
    if (!anchor) return;

    anchor.click();
  };
  // END Comment tip handle

  // Upload modal handle
  const openUploadModal = () => {
    setUploadingFile(null);
    setUploadComment('');
    dispatch(resetUploadState());
    setIsUploadOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadOpen(false);
  };

  const handleUploadSubmit = () => {
    if (!uploadingFile) return;

    const comment = normalizeNullableText(uploadComment);

    dispatch(
      uploadFile({
        file: uploadingFile,
        comment,
      })
    )
    .unwrap()
    .then(() => {
      setIsUploadOpen(false);
      setUploadingFile(null);
      setUploadComment('');
      dispatch(resetUploadState());
    })
    .catch(() => {});
  };
  // END Upload modal handle

  // Download handler
  const handleDownload = (fileId: number, originalName: string) => {
    if (downloadingId !== null) return;

    setDownloadError(null);
    setDownloadingId(fileId);

    downloadFile(fileId)
      .then((blob) => {
        saveBlob(blob, originalName);

        dispatch(
          markDownloaded({
            fileId,
            iso: new Date().toISOString(),
          })
        );
      })
      .catch(() => {
        setDownloadError('Не удалось скачать файл. Попробуйте ещё раз позже.');
      })
      .finally(() => {
        setDownloadingId(null);
      });
  }

  // Delete file modal handle
  const [isFileDeleteOpen, setIsFileDeleteOpen] = useState(false);

  const openDeleteModal = (fileId: number, fileName: string) => {
    setDeleteError(null);
    setDeleteTarget({ id: fileId, name: fileName });
    setIsFileDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteBusy) return;
    setIsFileDeleteOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
  };
  

  const handleDeleteConfirm = () => {
    if (!deleteTarget || deleteBusy) return;

    setDeleteBusy(true);
    setDeleteError(null);

    dispatch(removeFile({ fileId: deleteTarget.id }))
      .unwrap()
      .then(() => {
        setIsFileDeleteOpen(false);
        setDeleteTarget(null);
        setDeleteError(null);
      })
      .catch((e: unknown) => {
        const msg = errorToMessage(e, 'Не удалось удалить файл. Попробуйте ещё раз позже.');
        setDeleteError(msg);
      })
      .finally(() => {
        setDeleteBusy(false);
      });
  };
  // END Delete modal handle

  // Edit modal handle
  const [editingFile, setEditingFile] = useState<FileDTO | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editComment, setEditComment] = useState<string>('');
  const [editBusy, setEditBusy] = useState<boolean>(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);

  const openEditModal = (f: FileDTO) => {
    setEditErrors([]);
    setEditingFile(f);
    setEditName(f.original_name ?? '');
    setEditComment(f.comment ?? '');
  };

  const closeEditModal = () => {
    if (editBusy) return;
    setEditingFile(null);
    setEditErrors([]);
  };

  const handleEditSubmit = () => {
    const f = editingFile;
    if (!f || editBusy) return;

    const initialName = f.original_name ?? '';
    const initialComment = f.comment ?? null;

    const newName = editName.trim();
    const newComment = normalizeCommentForApi(editComment);

    const nameChanged = newName !== initialName;
    const commentChanged = newComment !== initialComment;


    if (!nameChanged && !commentChanged) {
      closeEditModal();
      return;
    }

    setEditBusy(true);
    setEditErrors([]);

    const ops: Promise<void>[] = [];
    const errors: string[] = [];

    if (nameChanged) {
      ops.push(
        patchRenameFile(f.id, newName)
          .then((res) => {
            dispatch(updateFileMeta({ fileId: f.id, original_name: res.original_name }));
          })
          .catch((e: unknown) => {
            errors.push(errorToMessage(e, 'Не удалось переименовать файл.'));
          })
      );
    }

    if (commentChanged) {
      ops.push(
        patchCommentFile(f.id, newComment)
          .then((res) => {
            dispatch(updateFileMeta({ fileId: f.id, comment: res.comment }));
          })
          .catch((e: unknown) => {
            errors.push(errorToMessage(e, 'Не удалось обновить комментарий.'));
          })
      );
    }

    Promise.allSettled(ops)
      .then(() => {
        if (errors.length > 0) {
          setEditErrors(errors);
          return;
        }

        setEditingFile(null);
        setEditErrors([]);
      })
      .finally(() => {
        setEditBusy(false);
      });
  };
  // END Edit modal handle

  // Share modal handle
  const [shareFileId, setShareFileId] = useState<number | null>(null);
  const shareFile =
  shareFileId === null ? null : items.find((x) => x.id === shareFileId) ?? null;
  const [shareStatus, setShareStatus] = useState<Status>('idle');
  const [shareError, setShareError] = useState<string | null>(null); 

  const openShareModal = (Id: number) => {
    setShareError(null);
    setShareStatus('idle');
    setShareFileId(Id);
  };

  const closeShareModal = () => {
    if (shareStatus === 'loading') return;

    setShareFileId(null);
  }; 

  const handleShareEnable = async () => {
    if (!shareFileId) return;

    setShareError(null);
    setShareStatus('loading');

    try {
      const res = await enableShare(shareFileId);
      dispatch(updateFileMeta({
        fileId: res.id,
        share_url: res.share_url,
        share_created: res.share_created,
      }));

      setShareFileId(res.id);
      setShareStatus('succeeded');
    } catch {
      setShareStatus('failed');
      setShareError('Не удалось создать ссылку. Попробуйте ещё раз.');
    }
  };

  const handleShareDisable = async () => {
    if (!shareFileId) return;

    setShareError(null);
    setShareStatus('loading');

    try {
      const res = await disableShare(shareFileId);

      dispatch(updateFileMeta({
        fileId: res.id,
        share_url: res.share_url ?? null,
        share_created: res.share_created ?? null,
      }));

      setShareStatus('succeeded');
      setShareFileId(null);
    } catch {
      setShareStatus('failed');
      setShareError('Не удалось отключить ссылку. Попробуйте ещё раз.');
    }
  };
  // END Share modal handle

  const { openUserModal, userModalProps, deleteModalProps } = useAdminUserModals({
    onGoToFiles: () => {},
  });

  const owner: UserInfo | null = targetUser ? {
    id: targetUser.id,
    username: targetUser.username,
    fullName: targetUser.fullName,
    email: targetUser.email,
  } : null;

  return (
    <div className='files'>
      <div className='files__topBar'>
        <h1 className='files__title'>Файлы</h1>
        {downloadError ? (
          <div className='files__downloadError' role='alert'>
            {downloadError}
          </div>
        ) : null}

        <div className='files__topRight'>
          {isOwnList ? (
              <button className='files__uploadBtn' type='button' onClick={openUploadModal}>
                Загрузить
              </button>
            ) : (
              <UserBadge
                user={owner}
                onUsernameClick={() => openUserModal(targetUser.id)}
              />
            )
          }
        </div>
      </div>

      <FilesUploadModal
        isOpen={isUploadOpen}
        file={uploadingFile}
        comment={uploadComment}
        status={uploadStatus}
        error={uploadError}
        onClose={closeUploadModal}
        onFileChange={setUploadingFile}
        onCommentChange={setUploadComment}
        onSubmit={handleUploadSubmit}
      />

      <FilesDeleteModal
        isOpen={isFileDeleteOpen}
        fileName={deleteTarget?.name ?? ''}
        isBusy={deleteBusy}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
      />

      <FilesEditModal
        isOpen={Boolean(editingFile)}
        name={editName}
        comment={editComment}
        isBusy={editBusy}
        errors={editErrors}
        onClose={closeEditModal}
        onNameChange={setEditName}
        onCommentChange={setEditComment}
        onSubmit={handleEditSubmit}
      />
      
      <FilesShareModal
        file={shareFile}
        status={shareStatus}
        error={shareError}
        onClose={closeShareModal}
        onEnable={handleShareEnable}
        onDisable={handleShareDisable}
      />

      <AdminUserModal {...userModalProps} />
      <AdminUserDeleteModal {...deleteModalProps} />

      {status === 'failed' && error && <div className='files__error'>{error}</div>}

      {status !== 'failed' && (
        <div
          className='files__box'
          onMouseOverCapture={handleMouseOverCapture}
          onMouseLeave={handleMouseLeave}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
        >
          <div className='files__tipZone' role='note'>
            <div className={`filesTip ${tip ? '' : 'filesTip--empty'}`}>
              {tip?.comment && (
                <div
                  className='filesTip__comment'
                  ref={commentRef}
                  onClick={forwardCommentClickToAnchor}
                >
                  <div className='filesTip__commentTitle'>Комментарий:</div>
                  <div className='filesTip__commentText'>{tip.comment}</div>
                </div>
              )}

              <div className='filesTip__label'>
                {tip ? 'Наведите на элемент списка для получения подсказки' : tipFallback}
              </div>
            </div>
          </div>

          <div className='files__xScroll'>
            <div className='files__scrollInner'>
              <div className='files__scroll'>
                <div className='files__header filesGrid'>
                  <div className='files__h files__hNum'>#</div>
                  <div className='files__h'>Имя</div>
                  <div className='files__h'>Размер</div>
                  <div className='files__h'>Загрузка</div>
                  <div className='files__h'>Скачивание</div>
                  <div className='files__h files__hActions'>Действия</div>
                </div>

                {status === 'loading' && <div className='files__hint'>Загружаем список…</div>}

                {status === 'succeeded' && (
                  <ol className='files__list'>
                    {items.map((f, idx) => {

                      const isShared = Boolean(f.share_url);

                      return (
                        <li className='files__row filesGrid' key={f.id}>
                          <div className='files__num'>{idx + 1}</div>

                          <button
                            className='files__name'
                            type='button'
                            onClick={() => openOrDownload(f.id)}
                            data-file-name-anchor='1'
                            data-comment={f.comment ?? ''}
                            title='Открыть/Скачать'
                          >
                            <span className='files__nameText'>{f.original_name}</span>
                          </button>

                          <div className='files__meta'>{formatBytes(f.size_bytes)}</div>
                          <div className='files__meta'>{formatDate(f.uploaded)}</div>
                          <div className='files__meta'>{formatDate(f.last_downloaded)}</div>

                          <div className='files__actions'>

                            <button
                              className='files__iconBtn'
                              type='button'
                              title='Редактировать'
                              onClick={() => openEditModal(f)}
                            >
                              ✎
                            </button>

                            <button
                              className={`files__iconBtn ${isShared ? 'files__iconBtn--active' : ''}`}
                              type='button'
                              title={
                                isShared
                                  ? `Публичная ссылка (создана: ${formatDate(f.share_created)})`
                                  : 'Создать публичную ссылку'
                              }
                              onClick={() => openShareModal(f.id)}
                            >
                              ⛓
                            </button>

                            <button
                              className='files__iconBtn files__iconBtn--download'
                              type='button'
                              title={downloadingId === f.id ? 'Скачивание…' : 'Скачать'}
                              onClick={() => handleDownload(f.id, f.original_name)}
                              disabled={downloadingId === f.id}
                            >
                              ⬇
                            </button>

                            <button
                              className='files__iconBtn'
                              type='button'
                              title='Удалить'
                              onClick={() => openDeleteModal(f.id, f.original_name)}
                            >
                              ✕
                            </button>

                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {status === 'succeeded' && items.length === 0 && <div className='files__hint'>Пока файлов нет.</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
