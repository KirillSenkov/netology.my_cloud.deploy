import type { RootState } from '../../app/store';

export const selectFetchStatus = (state: RootState) => state.adminUsers.fetchStatus;
export const selectRemoveStatus = (state: RootState) => state.adminUsers.removeStatus;
export const selectChangeLevelStatus = (state: RootState) => state.adminUsers.changeLevelStatus;

export const selectFetchError = (state: RootState) => state.adminUsers.fetchError;
export const selectRemoveError = (state: RootState) => state.adminUsers.removeError;
export const selectChangeLevelError = (state: RootState) => state.adminUsers.changeLevelError;

export const selectAdminUsersItems = (state: RootState) => state.adminUsers.items;

export const selectTargetUser = (state: RootState) => state.adminUsers.targetUser;
  