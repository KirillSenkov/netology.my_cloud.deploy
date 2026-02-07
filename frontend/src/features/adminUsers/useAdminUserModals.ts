import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

import { selectAuthUser } from '../auth/selectors';
import {
  selectChangeLevelStatus,
	selectRemoveStatus,
	selectChangeLevelError,
  selectRemoveError,
  selectTargetUser,
} from './selectors';

import {
	setTargetUser,
	removeUser,
  changeUserLevel,
  clearTargetUser,
  clearUsersErrors,
} from './adminUsersSlice';

import type { UserLevel, UserRank } from '../../api/types'
type Params = {
  onGoToFiles: (userId: number) => void;
};

export default function useAdminUserModals({ onGoToFiles }: Params) {
  const dispatch = useAppDispatch();

  const actorUser = useAppSelector(selectAuthUser);
  const targetUser = useAppSelector(selectTargetUser);

  const removeStatus = useAppSelector(selectRemoveStatus);
  const removeError = useAppSelector(selectRemoveError);

  const changeLevelStatus = useAppSelector(selectChangeLevelStatus);
  const changeLevelError = useAppSelector(selectChangeLevelError);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const actorLevel: UserLevel = actorUser?.level ?? 'user';
  const actorRank: UserRank = (actorUser?.rank ?? 3) as UserRank;

  const isChangingLevel = changeLevelStatus === 'loading';
  const isDeleting = removeStatus === 'loading';

  const openUserModal = useCallback(
    (userId: number) => {
      dispatch(clearUsersErrors());
      dispatch(setTargetUser(userId));
      setIsUserModalOpen(true);
    },
    [dispatch],
  );

  const closeUserModal = useCallback(() => {
    if (isChangingLevel || isDeleting) return;
    setIsUserModalOpen(false);
  }, [isChangingLevel, isDeleting]);

  const requestDelete = useCallback(() => {
    setIsDeleteOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    if (isDeleting) return;
    setIsDeleteOpen(false);
    dispatch(clearTargetUser());
  }, [isDeleting, dispatch]);

  const confirmDelete = useCallback(
    (deleteFiles: boolean) => {
      if (!targetUser) return;

      void dispatch(removeUser({ userId: targetUser.id, deleteFiles }))
        .unwrap()
        .then(() => {
          setIsDeleteOpen(false);
          setIsUserModalOpen(false);
          dispatch(clearTargetUser());
        })
        .catch(() => {});
    },
    [dispatch, targetUser],
  );

  const applyLevel = useCallback(
    (userId: number, level: UserLevel) => {
      void dispatch(changeUserLevel({ userId, level }))
        .unwrap()
        .catch(() => {});
    },
    [dispatch],
  );

  const userModalKey = useMemo(() => {
    return targetUser ? `${targetUser.id}:${targetUser.level}` : 'no-user';
  }, [targetUser]);

  const userModalProps = useMemo(
    () => ({
      key: userModalKey,
      user: targetUser,
      isOpen: isUserModalOpen,
      actorLevel,
      actorRank,
      isChangingLevel,
      isDeleting,
      changeLevelError,
      deleteError: removeError,
      onClose: closeUserModal,
      onGoToFiles,
      onChangeLevel: applyLevel,
      onDeleteRequest: requestDelete,
    }),
    [
      userModalKey,
      targetUser,
      isUserModalOpen,
      actorLevel,
      actorRank,
      isChangingLevel,
      isDeleting,
      changeLevelError,
      removeError,
      closeUserModal,
      onGoToFiles,
      applyLevel,
      requestDelete,
    ],
  );

  const deleteModalProps = useMemo(
    () => ({
      isOpen: isDeleteOpen,
      username: targetUser?.username ?? '',
      isBusy: isDeleting,
      error: removeError,
      onClose: closeDelete,
      onConfirm: confirmDelete,
    }),
    [isDeleteOpen, targetUser, isDeleting, removeError, closeDelete, confirmDelete],
  );

  return {
    openUserModal,
    userModalProps,
    deleteModalProps,
  };
}
