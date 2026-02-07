import type { RootState } from '../../app/store';

export const selectFilesItems = (state: RootState) => state.files.items;
export const selectFilesStatus = (state: RootState) => state.files.status;
export const selectFilesError = (state: RootState) => state.files.error;
